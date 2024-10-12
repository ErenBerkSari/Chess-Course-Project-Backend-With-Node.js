const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

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

const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı.`);
});
