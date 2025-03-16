import { Kafka, Producer } from "kafkajs";
import { setInterval } from "timers";
import { MongoDbConnector } from "../infra/mongoConnector";
import { logger } from "../logger";

export class SwapScheduler {
  private kafka: Kafka;
  private producer: Producer;
  private kafkaTopic: string;
  private mongoConnector: MongoDbConnector;

  constructor(
    mongoConnector: MongoDbConnector,
    kafkaClientId: string,
    kafkaBrokers: string[],
    kafkaTopic: string
  ) {
    this.mongoConnector = mongoConnector;
    this.kafka = new Kafka({
      clientId: kafkaClientId,
      brokers: kafkaBrokers,
    });
    this.producer = this.kafka.producer();
    this.kafkaTopic = kafkaTopic;
  }

  private async queryAndSendToKafka() {
    const now = Date.now();
    const fiveSecondsAgo = now - 5000;

    try {
      const swapOrderCollection = this.mongoConnector.getSwapOrders();

      const query = {
        scheduledTime: {
          $gte: fiveSecondsAgo,
          $lte: now,
        },
        status: {
          $eq: "scheduled",
        },
      };

      const orders = await swapOrderCollection.find(query).toArray();

      if (orders.length > 0) {
        await this.producer.connect();
        for (const order of orders) {
          await this.producer.send({
            topic: this.kafkaTopic,
            messages: [{ value: JSON.stringify(order) }],
          });
          logger.info(`Sent order to Kafka: ${JSON.stringify(order)}`);
        }
        logger.info(`Sent ${orders.length} orders to Kafka`);
        await swapOrderCollection.updateMany(
          query,
          {
            $set: {
              status: "pending",
            },
          },
          { upsert: false }
        );
      }
    } catch (error) {
      logger.error("Error querying MongoDB or sending to Kafka:", error);
    } finally {
      await this.producer.disconnect();
    }
  }

  public startScheduling() {
    setInterval(() => this.queryAndSendToKafka(), 5010);
  }
}
