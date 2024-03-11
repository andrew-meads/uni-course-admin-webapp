// Configure environment variables
import { PORT, DB_URL } from "./env.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

// Creates the express server
const app = express();

// Configure middleware (logging, CORS support, JSON parsing support, static files support)
// app.use(morgan("combined"));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Import and use our application routes.
import routes from "./routes/routes.js";
app.use("/", routes);

// Start the DB running. Then, once it's connected, start the server.
await mongoose.connect(DB_URL);
app.listen(PORT, () => console.log(`App server listening on port ${PORT}!`));
