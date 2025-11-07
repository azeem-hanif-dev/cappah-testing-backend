const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Cappah International APIs",
      version: "1.0.0",
      description: "API documentation for Cappah International",
      contact: {
        name: "Muhammad Saqib",
        email: "contact.msaqib@gmail.com",
        url: "https://github.com/developermsaqib",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1", // Change this URL to match your server
      },
      {
        url: "https://cappah-international-backend.vercel.app", // Change this URL to match your server
      },
    ],
  },
  apis: ["./Routes/*.js", "./Controllers/*.js"], // Path to the route files
};

// Generate swagger docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
