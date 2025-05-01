import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/Cloaudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "fs";
import { AuthRequest } from "../middlewares/authenticate";

const uploadCoverImageToCloudinary = async (image: Express.Multer.File) => {
    const coverImageMineType = image.mimetype.split("/").at(-1);
    const fileName = image.filename;
    const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
    );

    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMineType,
        });

        console.log("Image upload result:", uploadResult);
        return uploadResult.secure_url;
    } catch (error) {
        console.error("Error uploading cover image to Cloudinary:", error);
        throw createHttpError(500, "Failed to upload cover image");
    } finally {
        try {
            await fs.promises.unlink(filePath);
        } catch (err) {
            console.warn("Failed to delete temporary cover image:", err);
        }
    }
};

const uploadBookFileToCloudinary = async (file: Express.Multer.File) => {
    const fileName = file.filename;
    const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
    );

    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
            filename_override: fileName,
            folder: "book-files",
            format: "pdf",
        });

        console.log("Book upload result:", uploadResult);
        return uploadResult.secure_url;
    } catch (error) {
        console.error("Error uploading book file to Cloudinary:", error);
        throw createHttpError(500, "Failed to upload book pdf file");
    } finally {
        try {
            await fs.promises.unlink(filePath);
        } catch (err) {
            console.warn("Failed to delete temporary book file:", err);
        }
    }
};

const deleteCoverImageFromCloudinary = async (imageUrl: string) => {
    try {
        const coverImageUrlSplits = imageUrl.split("/");
        const coverImageCloudinaryPublicId =
            coverImageUrlSplits.at(-2) +
            "/" +
            coverImageUrlSplits.at(-1)?.split(".").at(0);
        await cloudinary.uploader.destroy(coverImageCloudinaryPublicId);
    } catch (error) {
        console.error("Error deleting cover image from Cloudinary:", error);
        return createHttpError(
            500,
            "Failed to delete cover image from Cloudinary"
        );
    }
};

const deleteBookFileFromCloudinary = async (fileUrl: string) => {
    try {
        const fileUrlSplits = fileUrl.split("/");
        const fileCloudinaryPublicId =
            fileUrlSplits.at(-2) + "/" + fileUrlSplits.at(-1)?.split(".").at(0);
        await cloudinary.uploader.destroy(fileCloudinaryPublicId, {
            resource_type: "raw",
        });
    } catch (error) {
        console.error("Error deleting book file from Cloudinary:", error);
        return createHttpError(
            500,
            "Failed to delete book pdf file from Cloudinary"
        );
    }
};

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre, description } = req.body;

    if (!title || !genre || !description) {
        return next(
            createHttpError(400, "Title, genre, and description are required")
        );
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.coverImage?.[0] || !files?.file?.[0]) {
        return next(
            createHttpError(400, "Cover image and book file are required")
        );
    }

    try {
        const coverImageUrl = await uploadCoverImageToCloudinary(
            files.coverImage[0]
        );
        const bookFileUrl = await uploadBookFileToCloudinary(files.file[0]);

        const _req = req as AuthRequest;

        try {
            const newBook = await bookModel.create({
                title,
                genre,
                description,
                author: _req.userId,
                coverImage: coverImageUrl,
                file: bookFileUrl,
            });
        } catch (error) {
            return next(createHttpError(500, "Error creating book"));
        }

        res.status(201).json({
            message: "Book uploaded successfully",
        });
    } catch (error) {
        console.error("Error in createBook:", error);
        return next(error);
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
            await deleteCoverImageFromCloudinary(book.coverImage);
            completeCoverImage = await uploadCoverImageToCloudinary(
                files.coverImage[0]
            );
        } catch (error) {
            return next(error);
        }
    }

    let completeFile = "";
    if (files.file) {
        try {
            await deleteBookFileFromCloudinary(book.file);
            completeFile = await uploadBookFileToCloudinary(files.file[0]);
        } catch (error) {
            return next(error);
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
};

const getSingleBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const bookId = req.params.bookId;

        const book = await bookModel
            .findOne({ _id: bookId })
            .populate("author", "name");

        if (!book) {
            return next(createHttpError(404, "Book not found"));
        }

        res.status(200).json(book);
    } catch (error) {
        return next(createHttpError(500, "Error while getting a book"));
    }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;

    try {
        const book = await bookModel.findOne({ _id: bookId });

        if (!book) {
            return next(createHttpError(404, "Book not found"));
        }

        const _req = req as AuthRequest;
        if (book.author.toString() !== _req.userId) {
            return next(
                createHttpError(
                    403,
                    "You are not authorized to update this book"
                )
            );
        }

        await deleteCoverImageFromCloudinary(book.coverImage);
        await deleteBookFileFromCloudinary(book.file);

        await bookModel.deleteOne({ _id: bookId });

        res.sendStatus(204);
    } catch (error) {
        return next(createHttpError(500, "Error while deteling the book!"));
    }
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
