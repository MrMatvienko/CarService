import Joi from "joi";

export const createCarValidator = (data) =>
  Joi.object()
    .keys({
      title: Joi.string().required(),
      brand: Joi.string().required(),
      year: Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .required(),
      price: Joi.number().min(0).required(),
      mileage: Joi.number().min(0).required(),
    })
    .validate(data);
