import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
    userId: string;
}

const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    /*  api header :
        ______________________________
        key            | value
        _______________|______________
        Authorization  | Bearer token 
        _______________|______________  */

    const token = req.header("Authorization");

    if (!token) {
        return next(createHttpError(401, "Authorization token is required"));
    }

    try {
        const parsedToken = token.split(" ")[1];
        const decoded = verify(parsedToken, config.jwtSecret);
        const _req = req as AuthRequest;
        _req.userId = decoded.sub as string;

        console.log("userId: in jwt : ",_req.userId);
        next();
    } catch (error) {
        return next(createHttpError(401, "Token expired or invalid"));
    }
};

export default authenticate;
