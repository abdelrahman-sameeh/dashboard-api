require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");

const connectDB = require("./api/connectDB");
const httpStatus = require("./utils/httpStatus");

const authRouter = require("./routes/auth.routes");
const cors = require("cors");

const app = express();
connectDB();

app.use(express.static("./public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors({}));


if (process.env.MODE == "dev") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use("/api/v1", authRouter);

app.all("*", (req, res) => {
  return res.status(404).json({ error: "not found this route" });
});

// global error
app.use((error, req, res, next) => {
  let jsonResponse =
    process.env.MODE == "dev"
      ? {
          message: error.message,
          status: httpStatus(error.statusCode),
          stack: error.stack,
        }
      : { message: error.message, status: httpStatus(error.statusCode) };

  res.status(error.statusCode || 500).json(jsonResponse);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
