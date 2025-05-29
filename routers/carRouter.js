import { Router } from "express";
import {
  addNewCar,
  deleteOneCar,
  geAllCar,
  getOneCar,
} from "../controllers/carControllers.js";

export const carsRouter = Router();

carsRouter.post("/", addNewCar);
carsRouter.get("/", geAllCar);
carsRouter.get("/:id", getOneCar);
carsRouter.delete("/:id", deleteOneCar);
