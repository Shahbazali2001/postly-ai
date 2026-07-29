import cron from "node-cron";
import { Post } from "../models/Post.js";
import { Account } from "../models/Account.js";
import zernio from "../config/zernioConfig.js";
import { ActivityLog } from "../models/ActivityLog.js";

export const initScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const postsToPublish = await Post.find({
        status: "scheduled",
        scheduledFor: { $lte: now },
      });

      for (const post of postsToPublish) {
        try {
          const platforms = Array.isArray(post.platforms)
            ? post.platforms
            : [post.platforms];

          const accounts = await Account.find({
            user: post.user,
            platform: { $in: platforms },
            status: "connected",
            zernioAccountId: { $exists: true },
          });

          if (accounts.length === 0) {
            console.log(`No connected accounts found for post ${post._id}`);
            continue;
          }

          const zernioPlatforms = accounts.map((account) => ({
            tform: account.platform as any,
            accountId: account.zernioAccountId!,
          }));

          const payload = {
            content: post.content,
            publishNow: true,
            ...(post.mediaUrl
              ? {
                  mediaItems: [
                    { type: post.mediaType || "image", url: post.mediaUrl },
                  ],
                }
              : {}),
            platforms: zernioPlatforms,
          };

          console.log(`Publishing post ${post._id} to ${zernioPlatforms}`);

          const response = await zernio.posts.createPost({ body: payload });
          const publishedPost = (response.data as any)?.post || response.data;

          if (!publishedPost) {
            throw new Error("Failed to publish post");
          }

          console.log(
            `Post ${publishedPost._id || publishedPost.id} was published successfully`,
          );

          post.status = "published";
          await post.save();

          // Creating Activity Log
          const activityLog = new ActivityLog({
            user: post.user,
            actionType: "POST_PUBLISHED",
            description: `Published post to ${accounts.map((a) => a.platform).join(", ")}`,
            relatedPost: post._id,
          });
          await activityLog.save();
        } catch (error: any) {
          console.error(`Error publishing post ${post._id}: ${error.message}`);
          post.status = "failed";
          await post.save();
        }
      }

      //Statement
      if (postsToPublish.length > 0) {
        console.log(
          `Evaluated ${postsToPublish.length} posts at ${now.toISOString()}`,
        );
      }
    } catch (error) {
      console.error(error);
    }
  });

  console.log("Scheduler initialized");
};
