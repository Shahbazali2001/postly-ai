import "dotenv/config";

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_DB_URI || "",
};
