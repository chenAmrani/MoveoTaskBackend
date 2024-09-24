"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const codeBlock_Route_1 = __importDefault(require("./routes/codeBlock_Route"));
require('dotenv').config();
const initApp = () => {
    const promise = new Promise((resolve) => {
        const db = mongoose_1.default.connection;
        db.once("open", () => console.log("Connected to Database"));
        db.on("error", (error) => console.error(error));
        const url = process.env.DB_URL;
        mongoose_1.default.connect(url).then(() => {
            const app = (0, express_1.default)();
            // Middleware setup
            app.use((0, cors_1.default)({ origin: '*' }));
            app.use(body_parser_1.default.json());
            app.use(body_parser_1.default.urlencoded({ extended: true }));
            // Routes setup
            app.get("/", (req, res) => {
                res.send("Welcome to the CodeBlock API!");
            });
            app.use("/codeblocks", codeBlock_Route_1.default);
            resolve(app);
        });
    });
    return promise;
};
exports.default = initApp;
