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
    const { id } = req.params;
    const cars = await Cars.findByIdAndDelete(id);

    return res.status(200).json({
      msg: "Success!",
      cars,
    });
  } catch (error) {
    res.status(404).json({ message: "Contact not found" });
  }
};
export const updateCarDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const car = await Cars.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!car) {
      return res.status(404).json({ msg: "Car not found" });
    }
    return res.status(200).json({
      msg: "Success!",
      car,
    });
  } catch (error) {
    console.log(error);
  }
};
