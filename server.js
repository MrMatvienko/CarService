const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // для парсингу JSON тіла

app.get("/", (req, res) => {
  res.send("Сервер працює!");
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
