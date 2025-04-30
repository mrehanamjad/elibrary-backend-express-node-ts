import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    // steps:
    // 1. validation
    // 2. Process (logic)
    // 3. Response

    const { name, email, password } = req.body;

    // validation:
    // module express validater can be used for complex validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    try {
        const user = await userModel.create({ name, email, password });
        if(user) {
            const error = createHttpError(400, "User with thos email already exists");
            return next(error);
        }

    } catch (error) {
        return next(createHttpError(500, "Error while getting user"))
    }

    const hashPassword = await bcrypt.hash(password, 10);

    

    res.json({ message: "User Registered Successfully" });
};

export { createUser };
