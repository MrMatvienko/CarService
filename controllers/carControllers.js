import { readFile, writeFile } from "fs/promises";
// import { nanoid } from "nanoid";
import { Cars } from "../models/carModels.js";
import { createCarValidator } from "../utils/carValidator.js";

export const addNewCar = async (req, res) => {
  try {
    const { value, error } = createCarValidator(req.body);

    const newCar = await Cars.create(value);

    return res.status(201).json({
      msg: "Success!",
      car: newCar,
    });
  } catch (error) {
    console.log(error);
  }
};

export const geAllCar = async (req, res) => {
  try {
    const cars = await Cars.find();

    return res.status(200).json({
      msg: "Success!",
      cars,
    });
  } catch (error) {
    console.log(error);
  }
};
export const getOneCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Cars.findById(id);

    return res.status(200).json({
      msg: "Success!",
      car,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteOneCar = async (req, res) => {
  try {
    const carsDB = await readFile("data.json");
    const cars = JSON.parse(carsDB);

    const carIndex = cars.findIndex((item) => item.id === req.params.id);

    if (carIndex === -1) return res.status(404).json({ msg: "Car not found" });

    const deleteCar = cars[carIndex];
    cars.splice(carIndex, 1);

    await writeFile("data.json", JSON.stringify(cars));

    return res.status(200).json({
      msg: "Success!",
      deleteCar,
    });
  } catch (error) {
    console.log(error);
  }
};
