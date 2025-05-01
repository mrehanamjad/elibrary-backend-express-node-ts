import express from "express";
import { createBook } from "./bookControllers";
import multer from "multer";
import path from "node:path";

const bookRouter = express.Router();

// multer working:
// store in local file  --> push to cloudinary --> delete from local
const uplaod = multer({
    dest: path.resolve(__dirname, "../../public/data/uplaod"),
    limits: { fieldSize: 3e7 }, // 3e7 = 30mb = 30 * 1024 * 1024
});

bookRouter.post(
    "/",
    uplaod.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    createBook
);

export default bookRouter;
