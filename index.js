import express from "express";
import { readFile, writeFile } from "fs/promises";
import { nanoid } from "nanoid";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  console.log(req);
  res.send("HI");
});

app.post("/cars", async (req, res) => {
  try {
    const { brand, price } = req.body;

    const newCar = {
      id: nanoid(),
      brand,
      price,
    };

    const carsDB = await readFile("data.json");
    const cars = JSON.parse(carsDB);

    cars.push(newCar);

    await writeFile("data.json", JSON.stringify(cars));

    return res.status(201).json({
      msg: "Success!",
      car: newCar,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/cars", async (req, res) => {
  try {
    const carsDB = await readFile("data.json");
    const cars = JSON.parse(carsDB);

    return res.status(200).json({
      msg: "Success!",
      cars,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/cars/:id", async (req, res) => {
  try {
    const carsDB = await readFile("data.json");
    const cars = JSON.parse(carsDB);
    const car = cars.find((item) => item.id === req.params.id);
    return res.status(200).json({
      msg: "Success!",
      car,
    });
  } catch (error) {
    console.log(error);
  }
});

app.delete("/cars/:id", async (req, res) => {
  try {
    const carsDB = await readFile("data.json");
    const cars = JSON.parse(carsDB);

    const carIndex = cars.findIndex((item) => item.id === req.params.id);

    if (carIndex === -1) {
      return res.status(404).json({ msg: "Car not found" });
    }

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
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
