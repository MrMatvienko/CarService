import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: "dmmckoh7r",
  api_key: "273976375224582",
  api_secret: "oFprpTtqnscoTXHKd6qruDFtV1s",
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

export { cloudinary };
