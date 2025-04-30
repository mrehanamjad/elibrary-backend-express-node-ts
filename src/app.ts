import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the  Elib apis" });
});

export default app;
