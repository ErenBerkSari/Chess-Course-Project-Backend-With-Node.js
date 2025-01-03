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

const allowedOrigins = [
  "http://localhost:5173", // Yerel geliştirme ortamı için
  "https://chess-course-project-backend-with-node-js.onrender.com", // Render'daki backend URL
  "https://chess101.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy does not allow this origin"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlantısı başarılı!"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/lessons", lessonRoute);
app.use("/articles", articleRoute);

const port = process.env.PORT || 3000; // Render'dan gelen dinamik PORT veya fallback olarak 3000 kullanılır
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı.`);
});
