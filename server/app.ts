import env from "dotenv";
env.config();
import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import codeBlockRoutes from './routes/codeBlock_Route';

require('dotenv').config(); 


const initApp = (): Promise<Express> => {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.once("open", () => console.log("Connected to Database"));
    db.on("error", (error: Error) => console.error(error));
    const url = process.env.DB_URL;
    mongoose.connect(url!).then(() => {
      const app = express();
      // Middleware setup
      const cors = require('cors');
    app.use(cors({
    origin: '*'}));

      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use("/codeblocks", codeBlockRoutes);
      
      resolve(app);
      });
      
    });
  return promise;
};

export default initApp;
