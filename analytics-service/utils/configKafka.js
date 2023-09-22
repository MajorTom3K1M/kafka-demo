const { Kafka, logLevel } = require('kafkajs');

async function ensureTopicExists(admin, topicName) {
  const topics = await admin.listTopics();
  if (!topics.includes(topicName)) {
    await admin.createTopics({
      topics: [{ topic: topicName }]
    });
    console.log(`Created topic ${topicName}`);
  }
}

const KAFKA_HOST = process.env.KAFKA_HOST || "localhost"

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  clientId: "demo",
  brokers: [`${KAFKA_HOST}:9092`],
});

const topicName = 'click_events';

const admin = kafka.admin();

async function run() {
  await admin.connect();
  await ensureTopicExists(admin, topicName);
  await admin.disconnect();
}

module.exports = run;