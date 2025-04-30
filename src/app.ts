import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the  Elib apis" });
});

// Registering the router
app.use("/api/users", userRouter);

//  in express middleware is just a function (having parameter req, res, next), that runs before the route handler, and can be used to modify the request and response objectsfore the route handler, and can be used to modify the request and response objects
// Global error handler is a special construct/funtion (having 4 parameter err, req, res, next), that runs when an error occurs in the application, and can be used to handle the error and send a response to the client
// Global error handler , should be in the last
app.use(
    globalErrorHandler as (
        err: HttpError,
        req: Request,
        res: Response,
        next: NextFunction
    ) => void
);

export default app;
