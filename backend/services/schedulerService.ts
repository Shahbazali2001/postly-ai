import cron from "node-cron";


export const initScheduler = () => {
    cron.schedule("* * * * *", async () => {
        console.log("running a task every minute");
    });
}