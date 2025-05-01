import { config as conf } from "dotenv";

conf();

const _config = {
    port: process.env.PORT as string,
    databaseUrl: process.env.MONGO_URI as string,
    env: process.env.NODE_ENV as string,
    jwtSecret: process.env.JWT_SECRET as string,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KAY as string,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string,
    frontendDomain: process.env.FRONTEND_DOMAIN as string,
}

export const config = Object.freeze(_config);