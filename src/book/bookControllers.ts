import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/Cloaudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "fs";
import { AuthRequest } from "../middlewares/authenticate";

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

        const _req = req as AuthRequest;

        try {
            const newBook = await bookModel.create({
                title,
                genre,
                description,
                author: _req.userId,
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
            message: "Book uploaded successfully",
        });
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, "Error uploading files"));
    }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre, description } = req.body;

    if (!title || !genre || !description) {
        return next(
            createHttpError(400, "Title, genre and description are required")
        );
    }

    const bookId = req.params.bookId;

    if (!bookId) {
        return next(createHttpError(400, "Book id is required"));
    }

    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
        return next(createHttpError(404, "Book not found"));
    }

    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
        return next(
            createHttpError(403, "You are not authorized to update this book")
        );
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let completeCoverImage = "";
    if (files.coverImage) {
        try {
            const fileName = files.coverImage[0].filename;
            const filePath = path.resolve(
                __dirname,
                "../../public/data/uploads",
                fileName
            );
            const coverImageMineType = files.coverImage[0].mimetype
                .split("/")
                .at(-1);
            completeCoverImage = fileName;
            const uploadResult = await cloudinary.uploader.upload(filePath, {
                filename_override: fileName,
                folder: "book-covers",
                formate: coverImageMineType,
            });

            completeCoverImage = uploadResult.secure_url;
            await fs.promises.unlink(filePath);
        } catch (error) {
            return next(createHttpError(500, "Error uploading cover image"));
        }
    }

    let completeFile = "";
    if (files.file) {
        try {
            const bookFileName = files.file[0].filename;
            const bookFilePath = path.resolve(
                __dirname,
                "../../public/data/uploads",
                bookFileName
            );
            completeFile = bookFileName;

            const bookFileUploadResult = await cloudinary.uploader.upload(
                bookFilePath,
                {
                    resource_type: "raw",
                    filename_override: bookFileName,
                    folder: "book-files",
                    format: "pdf",
                }
            );

            completeFile = bookFileUploadResult.secure_url;
            await fs.promises.unlink(bookFilePath);
        } catch (error) {
            return next(createHttpError(500, "Error uploading book pdf"));
        }
    }

    try {
        const updatedBook = await bookModel.findOneAndUpdate(
            {
                _id: bookId,
            },
            {
                title,
                genre,
                description,
                coverImage: completeCoverImage || book.coverImage,
                file: completeFile || book.file,
            },
            {
                new: true,
            }
        );

        res.status(200).json(updatedBook);
    } catch (error) {
        return next(createHttpError(500, "Error updating book"));
    }
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const books = await bookModel.find().populate("author", "name");
        res.status(200).json(books);
    } catch (error) {
        return next(createHttpError(500, "Error while getting books"));
    }
}

const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
    
    try {

        const bookId = req.params.bookId;

        const book = await bookModel.findOne({ _id: bookId }).populate("author", "name");

        if (!book) {
            return next(createHttpError(404, "Book not found"));
        }

        res.status(200).json(book);
    } catch (error) {
        return next(createHttpError(500, "Error while getting a book"));
    }
}

export { createBook, updateBook, listBooks, getSingleBook };
