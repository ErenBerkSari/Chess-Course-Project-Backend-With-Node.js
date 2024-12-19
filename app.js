const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const lessonRoute = require("./routes/lessonRoute");
const categoryRoute = require("./routes/categoryRoute");
const articleRoute = require("./routes/articleRoute");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // İzin verilen origin
  credentials: true, // İsteklerin kimlik bilgilerini (cookies, authorization headers vb.) içermesine izin ver
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Connect DB

mongoose
  .connect(
    "mongodb+srv://zeroth:sVjo2zfEOjqzIIYT@cluster5.hli1v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster5"
  )
  .then(() => console.log("MongoDB bağlantısı başarılı!"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/lessons", lessonRoute);
app.use("/categories", categoryRoute);
app.use("/articles", articleRoute);

const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı.`);
});
