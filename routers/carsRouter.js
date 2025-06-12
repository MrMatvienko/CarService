import { Router } from "express";
import {
  addNewCar,
  deleteCarByArticle,
  getAllCars,
  getCarByArticle,
  updateCarByArticle,
} from "../controllers/carControllers.js";
import { uploadMultipleImages } from "../middlewares/uploadImage.js";

export const carsRouter = Router();

carsRouter.route("/").post(uploadMultipleImages, addNewCar).get(getAllCars);
carsRouter.get("/:article", getCarByArticle);
carsRouter.delete("/:article", deleteCarByArticle);
carsRouter.patch("/:article", updateCarByArticle);
