const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const csrf = require("csurf");
const cookieParser = require("cookie-parser")
const bodyParser = require('body-parser')
// import database mongodb
const mongoose = require("mongoose");
const connectDB = require("./db/connect");

//
const fs = require("fs");
require("dotenv").config();

const csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false })

// create express app
const app = express();

// apply middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit:"5mb"}));
app.use(cors());
app.use(express.json({limit:"5mb"}));
app.use(cookieParser())
app.use(morgan("dev"));

// route
fs.readdirSync("./routes").map((r) =>
  app.use("/api", require(`./routes/${r}`))
);

// csrf
app.use(csrfProtection);
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// port
const port = process.env.PORT || 8000;

// app.listen(port, () => {
//   console.log(`Running server on port ${port}`);
// });

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
