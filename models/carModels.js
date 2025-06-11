import { model, Schema } from "mongoose";

const carSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    article: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

carSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.article) {
      ret.article = `${String(ret.article).padStart(3, "0")}`;
    }
    return ret;
  },
});
export const Cars = model("Car", carSchema);
