import { config as conf } from "dotenv";

conf();

const _config = {
    port: process.env.PORT as string,
    databaseUrl: process.env.MONGO_URI as string,
    env: process.env.NODE_ENV as string,
    jwtSecret: process.env.JWT_SECRET as string,
}

export const config = Object.freeze(_config);