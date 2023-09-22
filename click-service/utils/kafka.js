const { Kafka, CompressionTypes, logLevel } = require("kafkajs");

const KAFKA_HOST = process.env.KAFKA_HOST || "localhost";

const kafka = new Kafka({
  // logLevel: logLevel.INFO,
  clientId: "demo",
  brokers: [`${KAFKA_HOST}:9092`],
});
const producer = kafka.producer();

const sharedMiddleware = function (schema, topic) {
  const sigleDocOperation = [
    "save",
    "updateOne",
    "findOneAndUpdate",
    "deleteOne",
    "findOneAndDelete",
  ];
  for (const op of sigleDocOperation) {
    schema.post(op, (doc) => kafkaMiddleware(topic, op, doc));
  }
};

function kafkaMiddleware(topic, op, doc) {
  console.log(`A ${op} operation was executed on a document`);
  console.log(`A document that have operation is ${doc}`);
  const messages = [{ value: JSON.stringify({ op, doc }) }];
  console.log({ topic });
  const payload = {
    topic: topic,
    compression: CompressionTypes.GZIP,
    messages: messages,
  };

  sendMessage(payload);
}

const sendMessage = async (payload) => {
  await producer.connect();
  producer.send(payload);
};

module.exports = sharedMiddleware;
