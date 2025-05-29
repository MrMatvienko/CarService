import express from "express";
import { carsRouter } from "./routers/carRouter.js";
const app = express();

app.use(express.json());

app.use("/cars", carsRouter);

app.get("/cars", carsRouter);

app.get("/cars/:id", carsRouter);

app.delete("/cars/:id", carsRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
