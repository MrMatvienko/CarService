import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { carsRouter } from "./routers/carsRouter.js";
dotenv.config();
const app = express();
app.use(cors());

const { MONGO_URL } = process.env;
console.log("MONGO_URL:", MONGO_URL);
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Connected directly");
  })
  .catch((err) => {
    console.log("❌ Error direct connect", err);
  });

app.use(express.json());

const pathPrefix = "api/v1";

app.use(`/${pathPrefix}/cars`, carsRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    msg: "Oops! Resourse not found!",
  });
});
app.use((err, req, res, next) => {
  console.log(`Error: ${err.message}`);
  res.status(500).json({
    msg: err.message,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
