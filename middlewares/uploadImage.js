import multer from "multer";
import { storage } from "../utils/cloudinary.js";

export const upload = multer({ storage });
export const uploadMultipleImages = upload.array("images"); // Для галереї
