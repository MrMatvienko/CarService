import { Cars } from "../models/carModels.js";
import { createCarValidator } from "../utils/carValidator.js";

export const addNewCar = async (req, res, next) => {
  try {
    const { error, value } = createCarValidator(req.body);
    if (error) {
      return res.status(400).json({
        msg: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }
    let nextArticleNumber = 1;
    try {
      const lastCar = await Cars.findOne().sort({ article: -1 }).exec();
      if (lastCar && typeof lastCar.article === "number") {
        nextArticleNumber = lastCar.article + 1;
      }
    } catch (dbError) {
      console.warn(
        "Помилка при пошуку останнього article. Починаємо з 1.",
        dbError
      );
    }
    value.article = nextArticleNumber;

    const newCar = await Cars.create(value);

    return res.status(201).json({
      msg: "Success! Car added.",
      car: newCar,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.article) {
      return res.status(409).json({
        msg: "Conflict: Generated article number already exists. Please try again.",
      });
    }
    next(error);
  }
};

export const getAllCars = async (req, res, next) => {
  try {
    const cars = await Cars.find();

    return res.status(200).json({
      msg: "Success! All cars retrieved.",
      cars,
    });
  } catch (error) {
    next(error);
  }
};

// export const getOneCar = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const car = await Cars.findById(id);

//     if (!car) {
//       return res.status(404).json({ msg: "Car not found." });
//     }

//     return res.status(200).json({
//       msg: "Success! Car retrieved.",
//       car,
//     });
//   } catch (error) {
//     if (error.name === "CastError") {
//       return res.status(400).json({ msg: "Invalid car ID format." });
//     }
//     next(error);
//   }
// };

// export const deleteOneCar = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const car = await Cars.findByIdAndDelete(id);

//     if (!car) {
//       return res.status(404).json({ msg: "Car not found for deletion." });
//     }

//     return res.status(200).json({
//       msg: "Success! Car deleted.",
//       car,
//     });
//   } catch (error) {
//     if (error.name === "CastError") {
//       return res.status(400).json({ msg: "Invalid car ID format." });
//     }
//     next(error);
//   }
// };

// export const updateCarDetails = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;
//     const car = await Cars.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!car) {
//       return res.status(404).json({ msg: "Car not found for update." });
//     }
//     return res.status(200).json({
//       msg: "Success! Car updated.",
//       car,
//     });
//   } catch (error) {
//     if (error.name === "CastError") {
//       return res.status(400).json({ msg: "Invalid car ID format." });
//     }
//     next(error);
//   }
// };

export const getCarByArticle = async (req, res, next) => {
  try {
    const { article } = req.params;
    const car = await Cars.findOne({ article: Number(article) });

    if (!car) return res.status(404).json({ msg: "Car not found." });

    res.status(200).json({ msg: "Success!", car });
  } catch (error) {
    next(error);
  }
};
export const deleteCarByArticle = async (req, res, next) => {
  try {
    const { article } = req.params;
    const deletedCar = await Cars.findOneAndDelete({
      article: Number(article),
    });

    if (!deletedCar) return res.status(404).json({ msg: "Car not found." });

    res.status(200).json({ msg: "Car successfully deleted.", deletedCar });
  } catch (error) {
    next(error);
  }
};
export const updateCarByArticle = async (req, res, next) => {
  try {
    const { article } = req.params;
    const updatedCar = await Cars.findOneAndUpdate(
      { article: Number(article) },
      req.body,
      { new: true }
    );

    if (!updatedCar) return res.status(404).json({ msg: "Car not found." });

    res.status(200).json({ msg: "Car updated.", updatedCar });
  } catch (error) {
    next(error);
  }
};
