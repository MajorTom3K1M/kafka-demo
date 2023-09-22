// analytics-servic/index.js
const mongoose = require("mongoose");
const connectToMongoDB = require("./utils/db");
const configKafka = require("./utils/configKafka");
const { Kafka, logLevel } = require("kafkajs");

// MongoDB connection
connectToMongoDB();

// Kafka Config
configKafka().catch(console.error);

// Different Schemas for different types of analytics
const ClickSchema = mongoose.Schema({ type: String, count: Number });
const UserClickSchema = mongoose.Schema({ userId: String, count: Number });
const LocationClickSchema = mongoose.Schema({
  location: String,
  count: Number,
});
const TimeClickSchema = mongoose.Schema({ minute: String, count: Number });

const Click = mongoose.model("Click", ClickSchema);
const UserClick = mongoose.model("UserClick", UserClickSchema);
const LocationClick = mongoose.model("LocationClick", LocationClickSchema);
const TimeClick = mongoose.model("TimeClick", TimeClickSchema);

const KAFKA_HOST = process.env.KAFKA_HOST || "localhost";

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`${KAFKA_HOST}:9092`],
  clientId: "demo",
});

const OPERATION = {
  SAVE: "save",
  FIND_ONE_AND_UPDATE: "findOneAndUpdate",
  UPDATE_ONE: "updateOne",
  DELETE_ONE: "deleteOne",
  FIND_ONE_AND_DELETE: "findOneAndDelete"
}

const topic = "click_events";
const consumer = kafka.consumer({ groupId: "demo-group" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);
      
      const event = JSON.parse(message.value);

      const { op, doc } = event;

      if(op === OPERATION.SAVE) {

        // General click count
        updateCount(Click, { type: doc.type }, doc.type);

        // Clicks per user
        updateCount(UserClick, { userId: doc.userId }, doc.userId);

        // Clicks per location
        updateCount(LocationClick, { location: doc.location }, doc.location);

        // Clicks per minute
        const minute = new Date(doc.timestamp).toISOString().slice(0, 16);
        updateCount(TimeClick, { minute }, minute);
      }
    },
  })
};

run().catch(e => console.error(`[example/consumer] ${e.message}`, e));

async function updateCount(Model, query, key) {
  // If key is undefined or null terminate
  if(!key) return;

  const record = await Model.findOne(query);
  
  if (record) {
    record.count++;
    await record.save();
  } else {
    const newRecord = new Model({ [key]: key, count: 1 });
    await newRecord.save();
  }
};