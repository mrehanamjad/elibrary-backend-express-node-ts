import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/Cloaudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "fs";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre, description } = req.body;

    if (!title || !genre || !description) {
        return next(
            createHttpError(400, "Title, genre and description are required")
        );
    }

    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        if (!files.coverImage || !files.file) {
            return next(
                createHttpError(400, "Cover image and file are required")
            );
        }

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

        try {
            const newBook = await bookModel.create({
                title,
                genre,
                description,
                author: "6812c94253d987966ed4f8b8",
                coverImage: uploadResult.secure_url,
                file: bookFileUploadResult.secure_url,
            });
        } catch (error) {
            console.log(error);
            return next(createHttpError(500, "Error creating book"));
        }

        try {
            await fs.promises.unlink(filePath);
            await fs.promises.unlink(bookFilePath);
        } catch (error) {
            console.log("Error deleting files", error);
        }

        res.status(201).json({
            message: "Book created successfully",
        });
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, "Error uploading files"));
    }
};

export { createBook };
