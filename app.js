import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./src/routes/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/api/status", (req, res) => {
  return res.json({
    success: true,
    message: "Server is running.",
  });
});

app.use("/api", router);

app.listen(process.env.SERVER_PORT, () => {
  console.log("Server is listening on port " + process.env.SERVER_PORT);
});
