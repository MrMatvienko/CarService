import { Cars } from "../models/carModels.js";
import { createCarValidator } from "../utils/carValidator.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewCar = async (req, res, next) => {
  try {
    // --- Початок логування для діагностики ---
    console.log(
      "--- Отримано запит на додавання нового авто (кілька фото) ---"
    );
    console.log("req.body (дані форми):", req.body);
    console.log("req.files (інформація про завантажені файли):", req.files); // ЗВЕРНІТЬ УВАГУ: req.files
    // --- Кінець логування для діагностики ---

    // 1. Валідація вхідних даних (текстові поля)
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

    // 2. Перевірка наявності файлів зображень
    // Multer (через CloudinaryStorage) обробляє файли і поміщає інформацію в req.files (масив)
    if (!req.files || req.files.length === 0) {
      console.error(
        "Помилка: файли зображень відсутні або не оброблені Multer'ом."
      );
      return res
        .status(400)
        .json({ msg: "Image files are required or could not be processed." });
    }

    // 3. Збираємо дані про завантажені зображення
    const uploadedImages = req.files.map((file) => ({
      url: file.path, // Multer/CloudinaryStorage розміщує URL у 'path'
      public_id: file.filename, // Multer/CloudinaryStorage розміщує public_id у 'filename'
      // АБО 'public_id' якщо ви налаштували MulterStorage
      // ПЕРЕВІРТЕ ОБ'ЄКТ file в логах щоб знати де саме public_id
    }));

    // 4. Генерація наступного номера статті (article)
    let nextArticleNumber = 1;
    const lastCar = await Cars.findOne().sort({ article: -1 }).exec();
    if (lastCar?.article) {
      nextArticleNumber = lastCar.article + 1;
    }

    // 5. Створення нового запису авто в MongoDB
    const newCar = await Cars.create({
      ...value, // Всі валідовані текстові поля з req.body
      article: nextArticleNumber,
      images: uploadedImages, // Тепер це масив об'єктів зображень
    });

    // 6. Успішна відповідь
    return res.status(201).json({
      msg: "Success! Car added.",
      car: newCar,
    });
  } catch (error) {
    // Обробка помилок
    console.error("Загальна помилка при додаванні авто:", error);

    // Специфічна обробка помилки дубліката номера статті
    if (error.code === 11000 && error.keyPattern && error.keyPattern.article) {
      return res.status(409).json({
        msg: "Conflict: Generated article number already exists. Please try again.",
      });
    }

    // Передача помилки далі до централізованого обробника помилок Express
    next(error);
  }
};

export const getAllCars = async (req, res, next) => {
  try {
    const cars = await Cars.find();

    return res.status(200).json({
      cars,
      msg: "Success! All cars retrieved.",
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
    const { article } = req.params; // Отримуємо номер статті з URL

    // 1. Знайти авто за номером статті
    const carToDelete = await Cars.findOne({ article: article }).exec();

    if (!carToDelete) {
      console.log(`Авто з артикулом ${article} не знайдено.`);
      return res.status(404).json({ msg: "Car not found." });
    }

    // 2. Зібрати public_id всіх зображень авто
    const imagePublicIds = carToDelete.images.map((img) => img.public_id);

    // --- Початок: Видалення зображень з Cloudinary ---
    if (imagePublicIds.length > 0) {
      try {
        const deleteResult = await cloudinary.api.delete_resources(
          imagePublicIds
        );
        console.log(
          "Результат видалення зображень з Cloudinary:",
          deleteResult
        );

        // Перевірка, чи всі зображення були видалені.
        // Cloudinary повертає об'єкт з ключем 'deleted' (або 'deleted_counts' для delete_resources)
        // який містить список public_id та їх статус.
        // Залежно від версії Cloudinary API та успішності, структура може трохи відрізнятись.
        // Якщо deleteResult.deleted - це об'єкт, можна перевірити його ключі.
        // Наприклад, 'deleteResult.deleted_counts.original'
        const deletedCount = Object.keys(deleteResult.deleted || {}).length;
        if (deletedCount !== imagePublicIds.length) {
          console.warn(
            `Увага: Не всі очікувані зображення (${imagePublicIds.length}) були видалені з Cloudinary. Видалено: ${deletedCount}`
          );
        }
      } catch (cloudinaryError) {
        // Логуємо помилку Cloudinary, але не перериваємо процес видалення авто з БД
        // (Можливо, ви захочете змінити цю логіку, якщо видалення картинок є критичним)
        console.error(
          "Помилка при видаленні зображень з Cloudinary:",
          cloudinaryError
        );
        // Ви можете вирішити повернути 500 тут або продовжити і видалити авто з БД
        // return res.status(500).json({ msg: "Failed to delete images from Cloudinary." });
      }
    }
    // --- Кінець: Видалення зображень з Cloudinary ---

    // 3. Видалити запис авто з MongoDB
    // Використовуємо deleteOne або findByIdAndDelete, але findOneAndDelete є кращим
    // якщо ми вже знайшли об'єкт.
    await Cars.deleteOne({ article: article });
    // Або: await Cars.findByIdAndDelete(carToDelete._id);

    console.log(
      `Авто з артикулом ${article} та пов'язані зображення успішно видалено.`
    );
    return res
      .status(200)
      .json({ msg: "Car and associated images successfully deleted." });
  } catch (error) {
    console.error("Помилка при видаленні авто за артикулом:", error);
    next(error); // Передаємо помилку далі до обробника помилок Express
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
