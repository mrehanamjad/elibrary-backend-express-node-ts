import { config as conf } from "dotenv";

conf();

const _config = {
    port: process.env.PORT as string,
    databaseUrl: process.env.MONGO_URI as string,
}

export const config = Object.freeze(_config);