import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/Cloaudinary";
import path from "node:path";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    // console.log("files :: ", req.files);
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        const coverImageMineType = files.coverImage[0].mimetype
            .split("/")
            .at(-1);
        const fileName = files.coverImage[0].filename;
        const filePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            fileName
        );

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            formate: coverImageMineType,
        });

        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            bookFileName
        );

        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath,
            {
                resource_type: "raw",
                filename_override: bookFileName,
                folder: "book-files",
                format: "pdf",
            }
        );
        console.log("image upload result", uploadResult);
        console.log("book upload result", bookFileUploadResult);

        res.json({});
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, "Error uploading files"));
    }
};

export { createBook };
