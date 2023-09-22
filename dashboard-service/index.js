// dashboard-service/index.js
const express = require("express");
const mongoose = require("mongoose");
const connectToMongoDB = require("./utils/db");
const configKafka = require("./utils/configKafka");

// MongoDB connection
connectToMongoDB();

// Kafka Config
configKafka().catch(console.error);

const ClickSchema = mongoose.Schema({ type: String, count: Number });
const UserClickSchema = mongoose.Schema({ userId: String, count: Number });
const LocationClickSchema = mongoose.Schema({ location: String, count: Number });
const TimeClickSchema = mongoose.Schema({ minute: String, count: Number });

const Click = mongoose.model("Click", ClickSchema);
const UserClick = mongoose.model("UserClick", UserClickSchema);
const LocationClick = mongoose.model("LocationClick", LocationClickSchema);
const TimeClick = mongoose.model("TimeClick", TimeClickSchema);

const app = express();
const port = process.env.PORT || 3001;

app.get("/analytics/general", async (_, res) => res.json(await Click.find({})));
app.get("/analytics/user", async (_, res) => res.json(await UserClick.find({})));
app.get("/analytics/location", async (_, res) => res.json(await LocationClick.find({})));
app.get("/analytics/time", async (_, res) => res.json(await TimeClick.find({})));

app.listen(port, () => {
  console.log(`Dashboard Service Listening on Port : ${port}`);
});
