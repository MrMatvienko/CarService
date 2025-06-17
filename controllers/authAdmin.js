import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

export async function checkAdminPassword(req, res) {
  try {
    const { password } = req.body;

    const isMatch = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({ message: "Access granted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}
