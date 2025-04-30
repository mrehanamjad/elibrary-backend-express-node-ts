import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    // steps:
    // 1. validation
    // 2. Process (logic)
    // 3. Response

    const {name, email, password} = req.body;



    // validation:
    // module express validater can be se for complex validation
    if(!name || !email || !password) {
        const error = createHttpError(400, "All fields are required")
        return next(error)
    }

    res.json({ message: "User Registered Successfully" });
};

export { createUser };
