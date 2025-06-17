require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");

const connectDB = require("./api/connectDB");
const httpStatus = require("./utils/httpStatus");

const authRouter = require("./routes/auth.routes");
const packageRoute = require("./routes/package.routes");
const mailRoute = require("./routes/mail.routes");
const clientRoute = require("./routes/client.routes");
const dashboard = require("./routes/dashboard.router");

const cors = require("cors");

require("./jobs/remove-cvs")

const app = express();
connectDB();

app.use(express.static("./public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors({
   origin: ["https://seajobs.netlify.app"]
}));


if (process.env.MODE == "dev") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use("/api/v1", authRouter);
app.use("/api/v1", packageRoute);
app.use("/api/v1", mailRoute);
app.use("/api/v1", clientRoute);
app.use("/api/v1", dashboard);

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
