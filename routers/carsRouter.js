import { Router } from "express";
import {
  addNewCar,
  deleteOneCar,
  geAllCar,
  getOneCar,
  updateCarDetails,
} from "../controllers/carControllers.js";

export const carsRouter = Router();

carsRouter.route("/").post(addNewCar).get(geAllCar);
carsRouter
  .route("/:id")
  .get(getOneCar)
  .delete(deleteOneCar)
  .put(updateCarDetails);
