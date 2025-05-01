import express from "express";
import { createBook, updateBook } from "./bookControllers";
import multer from "multer";
import path from "node:path";
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();

// multer working:
// store file in local files  --> push to cloudinary --> delete from local
const uplaod = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

bookRouter.post(
    "/",
    authenticate,
    uplaod.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    createBook
);

bookRouter.patch(
    "/:bookId",
    authenticate,
    uplaod.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    updateBook
);

export default bookRouter;
