// Calling Packages
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const routes = require("./Routes/index.routes");
const cors = require("cors");
const path = require("path");
require("./Cron/event.cron");
const { swaggerUi, swaggerDocs } = require("./Config/swagger.config");

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cappah-international.vercel.app",
      "https://cappah-international-backend.vercel.app",
      "https://cappah.com",
      "https://www.cappah.com",
      
    ],
    credentials: true, // Allow cookies and credentials
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 25 * 1024 * 1024 },
  })
);

// Using Express to Handle Json Response
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// File path middleware setting
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/tmp/", express.static(path.join(__dirname, "tmp")));

// Use to Print the Path and method of the routes
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Assigning Path to Api
app.use(routes);

// MongoDB, Server setup & connection
const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log("MongoDB is Setup and Server is running on " + port);
    });
  })
  .catch((error) => {
    console.log(error);
  });


// 
//       Developed by: Faizan Ahmad
//       Designation: Senior Developer
//       Email: faizana22333@gmail.com
//       © 2025 Digital Stationz. All rights reserved.
//
