import Joi from "joi";

export const createCarValidator = (data) =>
  Joi.object()
    .keys({
      title: Joi.string().required,
      brand: Joi.string().required,
      mileage: Joi.number().required,
      price: Joi.number().required,
    })
    .validate(data);
