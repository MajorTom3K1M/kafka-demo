// click-servic/index.js
const express = require("express");
const connectToMongoDB = require('./utils/db');
const configKafka = require("./utils/configKafka");

const ClickLogsModel = require("./models/ClickLogsModel");

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
connectToMongoDB();

// Kafka Config
configKafka().catch(console.error);

app.use(express.json());

app.get("/", (req, res, next) => {
  res.send("Click Service OK!");
});

app.post("/click", async (req, res) => {
    await ClickLogsModel.create({ type: "test" });

    res.send("Click!!!")
});

app.listen(port, () => {
  console.log(`Click Service Listening on Port : ${port}`);
});
