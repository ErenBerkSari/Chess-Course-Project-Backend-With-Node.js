const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const lessonRoute = require("./routes/lessonRoute");
const categoryRoute = require("./routes/categoryRoute");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//Connect DB
mongoose
  .connect("mongodb://127.0.0.1/chess-db")
  .then(() => {
    console.log("DB Connected Succesfuly");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/lessons", lessonRoute);
app.use("/categories", categoryRoute);

const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı.`);
});
