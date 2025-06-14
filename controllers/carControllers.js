import { Cars } from "../models/carModels.js";
import { createCarValidator } from "../utils/carValidator.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewCar = async (req, res, next) => {
  try {
    console.log(
      "--- Отримано запит на додавання нового авто (кілька фото) ---"
    );
    console.log("req.body (дані форми):", req.body);
    console.log("req.files (інформація про завантажені файли):", req.files);

    const { error, value } = createCarValidator(req.body);
    if (error) {
      console.error(
        "Помилка валідації Joi:",
        error.details.map((d) => d.message)
      );
      return res.status(400).json({
        msg: "Validation error: Invalid input data.",
        details: error.details.map((d) => d.message),
      });
    }

    if (!req.files || req.files.length === 0) {
      console.error(
        "Помилка: файли зображень відсутні або не оброблені Multer'ом."
      );
      return res
        .status(400)
        .json({ msg: "Image files are required or could not be processed." });
    }

    const uploadedImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    let nextArticleNumber = 1;
    const lastCar = await Cars.findOne().sort({ article: -1 }).exec();
    if (lastCar?.article) {
      nextArticleNumber = lastCar.article + 1;
    }

    const newCar = await Cars.create({
      ...value,
      article: nextArticleNumber,
      images: uploadedImages,
    });
    return res.status(201).json({
      msg: "Success! Car added.",
      car: newCar,
    });
  } catch (error) {
    console.error("Загальна помилка при додаванні авто:", error);
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
    const { brand, skip = 0, limit = 6 } = req.query;
    const filter = {};
    if (brand) filter.brand = brand;

    const cars = await Cars.find(filter)
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Cars.countDocuments(filter);

    return res.status(200).json({
      msg: "Success! Cars retrieved with filter and pagination.",
      cars,
      total,
    });
  } catch (error) {
    next(error);
  }
};

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

    const carToDelete = await Cars.findOne({ article: article }).exec();

    if (!carToDelete) {
      console.log(`Авто з артикулом ${article} не знайдено.`);
      return res.status(404).json({ msg: "Car not found." });
    }
    const imagePublicIds = carToDelete.images.map((img) => img.public_id);

    if (imagePublicIds.length > 0) {
      try {
        const deleteResult = await cloudinary.api.delete_resources(
          imagePublicIds
        );
        console.log(
          "Результат видалення зображень з Cloudinary:",
          deleteResult
        );

        const deletedCount = Object.keys(deleteResult.deleted || {}).length;
        if (deletedCount !== imagePublicIds.length) {
          console.warn(
            `Увага: Не всі очікувані зображення (${imagePublicIds.length}) були видалені з Cloudinary. Видалено: ${deletedCount}`
          );
        }
      } catch (cloudinaryError) {
        console.error(
          "Помилка при видаленні зображень з Cloudinary:",
          cloudinaryError
        );
      }
    }
    await Cars.deleteOne({ article: article });
    console.log(
      `Авто з артикулом ${article} та пов'язані зображення успішно видалено.`
    );
    return res
      .status(200)
      .json({ msg: "Car and associated images successfully deleted." });
  } catch (error) {
    console.error("Помилка при видаленні авто за артикулом:", error);
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
