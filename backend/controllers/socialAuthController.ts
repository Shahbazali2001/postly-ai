import { Request, Response } from "express";
import zernio from "../config/zernioConfig.js";
import { User } from "../models/User.js";
import { Account } from "../models/Account.js";

//Request Interface
import { AuthRequest } from "../middlewares/authMiddleware.js";


// Helper to ensue that the user has zernio profile
export const gerOrCreateZernioProfile = async (user: any): Promise<void> => {
    try{
        const result = await zernio.profiles.listProfiles();
        const data = result.data as any;
        const profiles : any[] = Array.isArray(data) ? data : data?.profiles || data?.data || [];0

        if(profiles.length > 0){
            const pid = profiles[0]._id || profiles[0].id;
            await User.findByIdAndUpdate(user._id, { zernioProfileId: pid });
            return pid;
        }

        // Create a new zernio profile

        const createResult = await zernio.profiles.createProfile({
            body : {
                name: `${user.name || user.email}'s workspace`,
            } as any,
        })

        const created = (createResult.data as any)?.profile || (createResult.data as any)?.data;
        const pid = created._id || created.id;
        if(!pid){
            throw new Error("Failed to create zernio profile");
        }
        await User.findByIdAndUpdate(user._id, { zernioProfileId: pid });
        return pid;
    }catch(err : any){
        console.error("Error creating zernio profile", err?.message || err);
        throw err;
    }
}




// Generate OAuth URL
// GET api/auth/:platform

export const generateOAuthURL = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const platform = req.params.platform;
        const profileId = await gerOrCreateZernioProfile(req.user);
        const origin = req.headers.origin;
        const redirectUrl = `${origin}/accounts`;
        const result = await zernio.connect.getConnectUrl({
            path : {platform : platform as any},
            query : {
                profileId,
                redirect_url : redirectUrl,
            }
        })

        const data = result.data as any;
        console.log("getConnectUrl Response :", JSON.stringify(data, null, 2));
        const authUrl = data.authUrl;
        if(!authUrl){
            throw new Error(`Failed to generate OAuth URL. Full response: ${JSON.stringify(data)}`);
        }
        res.status(200).json({ url : authUrl });
    }
    catch(err : any){
        console.error("Error generating OAuth URL", err?.message || err);
        res.status(500).json({ message : err?.message || err });
    }
}



// Sync Connected Accounts from Zernio into MongoDB
// GET api/auth/sync
export const syncConnectedAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const profileId = await gerOrCreateZernioProfile(req.user);
        const result = await zernio.accounts.listAccounts({
            query : {
                profileId,
            } as any
        })

        const data = result.data as any;
        const zernioAccounts: any[] = data?.accounts || (Array.isArray(data) ? data : []);
        const supportedPlatform = ["twitter", "linkedin", "facebook", "instagram"];
        const syncedAccounts = [];

        for (const account of zernioAccounts) {

                const zid = account._id || account.id;
                if(!zid){
                    console.warn("Skipping account without id :", zid);
                    continue;
                }

                const rawPlatform = (account.platform || account.type).toLowerCase();
                const normalizedPlatform = supportedPlatform.find((p) => p === rawPlatform.includes(p));

                if(!normalizedPlatform){
                    console.warn("Skipping account with unsupported platform :", rawPlatform);
                    continue;
                }

                const accountRecord = await Account.findOneAndUpdate(
                    { zernioAccountId : zid },
                    {
                        user : req.user._id, 
                        platform : normalizedPlatform, 
                        handle : account.username || account.name || account.handle || "Unknown", 
                        zernioAccountId : zid,
                        status : "connected",
                        avatarUrl : account.avatarUrl || account.picture || account.profile_image_url,

                    },
                    {
                        upsert : true,
                        returnDocument : "after",
                    }
                )


                syncedAccounts.push(accountRecord);
        }

        res.status(200).json({ syncedAccounts });
    }
    catch(err : any){
        console.error("Error syncing connected accounts", err?.message || err);
        res.status(500).json({ message : err?.message || err });
    }
}