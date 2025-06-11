import { Router } from "express";
import {
  addNewCar,
  deleteCarByArticle,
  getAllCars,
  getCarByArticle,
  updateCarByArticle,
} from "../controllers/carControllers.js";

export const carsRouter = Router();

carsRouter.route("/").post(addNewCar).get(getAllCars);
carsRouter.get("/:article", getCarByArticle);
carsRouter.delete("/:article", deleteCarByArticle);
carsRouter.patch("/:article", updateCarByArticle);
