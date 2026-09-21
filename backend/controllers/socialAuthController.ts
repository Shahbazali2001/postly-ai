import { Response } from "express";
import zernio from "../config/zernioConfig.js";
import { User } from "../models/User.js";
import { Account } from "../models/Account.js";
import { AuthRequest } from "../interfaces/AuthRequest.js";

// Helper to ensure that the user has a zernio profile
export const gerOrCreateZernioProfile = async (user: any): Promise<string> => {
  try {
    if (
      user.zernioProfileId &&
      typeof user.zernioProfileId === "string" &&
      user.zernioProfileId.trim() !== ""
    ) {
      return user.zernioProfileId;
    }

    const result = await zernio.profiles.listProfiles();
    const data = result.data as any;
    const profiles: any[] = Array.isArray(data)
      ? data
      : data?.profiles || data?.data || [];

    if (profiles.length > 0) {
      const pid = profiles[0]._id || profiles[0].id;
      if (pid) {
        await User.findByIdAndUpdate(user._id, { zernioProfileId: pid });
        return pid;
      }
    }

    // Create a new zernio profile
    const createResult = await zernio.profiles.createProfile({
      body: {
        name: `${user.name || user.email}'s workspace`,
      } as any,
    });

    const created =
      (createResult.data as any)?.profile ||
      (createResult.data as any)?.data ||
      createResult.data;
    const pid = created?._id || created?.id;
    if (!pid) {
      throw new Error("Failed to create zernio profile");
    }
    await User.findByIdAndUpdate(user._id, { zernioProfileId: pid });
    return pid;
  } catch (err: any) {
    console.error("Error creating/getting zernio profile", err?.message || err);
    throw err;
  }
};

// Generate OAuth URL
// GET /api/oauth/:platform/url
export const generateOAuthURL = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const platform = req.params.platform;
    const profileId = await gerOrCreateZernioProfile(req.user);
    const origin = req.headers.origin || "http://localhost:5173";
    const redirectUrl = `${origin}/accounts?connected=${platform}`;

    const result = await zernio.connect.getConnectUrl({
      path: { platform: platform as any },
      query: {
        profileId,
        redirect_url: redirectUrl,
      },
    });

    const data = result.data as any;
    console.log("getConnectUrl Response:", JSON.stringify(data, null, 2));
    const authUrl = data?.authUrl || data?.url;
    if (!authUrl) {
      throw new Error(
        `Failed to generate OAuth URL. Response: ${JSON.stringify(data)}`,
      );
    }
    res.status(200).json({ url: authUrl });
  } catch (err: any) {
    console.error("Error generating OAuth URL:", err?.message || err);
    res
      .status(500)
      .json({ message: err?.message || "Failed to generate OAuth URL" });
  }
};

// Sync Connected Accounts from Zernio into MongoDB
// GET /api/oauth/sync
export const syncConnectedAccounts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const profileId = await gerOrCreateZernioProfile(req.user);
    const result = await zernio.accounts.listAccounts({
      query: {
        profileId,
      } as any,
    });

    const data = result.data as any;
    const zernioAccounts: any[] =
      data?.accounts || (Array.isArray(data) ? data : data?.data || []);
    const supportedPlatform = ["twitter", "linkedin", "facebook", "instagram"];
    const syncedAccounts = [];

    for (const account of zernioAccounts) {
      const zid = account._id || account.id;
      if (!zid) {
        console.warn("Skipping account without id:", zid);
        continue;
      }
      const rawPlatform = (
        account.platform ||
        account.type ||
        ""
      ).toLowerCase();
      const normalizedPlatform =
        supportedPlatform.find((p) => rawPlatform.includes(p)) || rawPlatform;

      const accountRecord = await Account.findOneAndUpdate(
        { zernioAccountId: zid },
        {
          user: req.user._id,
          platform: normalizedPlatform,
          handle:
            account.username ||
            account.name ||
            account.handle ||
            "Connected Account",
          zernioAccountId: zid,
          status: "connected",
          avatarUrl:
            account.avatarUrl ||
            account.picture ||
            account.profile_image_url ||
            "",
        },
        {
          upsert: true,
          new: true,
          returnDocument: "after",
        },
      );

      syncedAccounts.push(accountRecord);
    }

    res.status(200).json({ syncedAccounts });
  } catch (err: any) {
    console.error("Error syncing connected accounts:", err?.message || err);
    res
      .status(500)
      .json({ message: err?.message || "Failed to sync accounts" });
  }
};
