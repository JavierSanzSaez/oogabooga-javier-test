import { Kafka, Consumer } from "kafkajs";
import { Environment } from "../environment";
import { MongoDbConnector } from "../infra/mongoConnector";
import path from "path";
import { Worker } from "worker_threads";
import { logger } from "../logger";

export class SwapExecutorOrchestrator {
  private kafka: Kafka;
  private consumer: Consumer;
  private workerPool: Worker[] = [];
  private maxWorkers: number = 10;

  constructor() {
    this.kafka = new Kafka({
      clientId: "janus",
      brokers: Environment.KAFKA_BROKERS.split(","),
    });
    this.consumer = this.kafka.consumer({ groupId: "janus-group" });
  }

  public async start(mongoConnector: MongoDbConnector) {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: Environment.KAFKA_TOPIC });

    this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (message.value) {
          const eventData = JSON.parse(message.value.toString());
          this.handleSwap(eventData, mongoConnector);
        }
      },
    });

    logger.info("Listening to Swap Orders...");
  }

  private async handleSwap(eventData: any, mongoConnector: MongoDbConnector) {
    if (this.workerPool.length < this.maxWorkers) {
      logger.info("Handling swap order:", eventData);
      const worker = new Worker(
        path.resolve(__dirname, "./swapExecutorWorker.ts"),
        {
          workerData: { eventData, mongoConnector },
        }
      );
      this.workerPool.push(worker);

      worker.on("message", (result) => {
        logger.info("Worker result:", result);
        this.workerPool = this.workerPool.filter((w) => w !== worker);
      });

      worker.on("error", (error) => {
        logger.error("Worker error:", error);
        this.workerPool = this.workerPool.filter((w) => w !== worker);
      });

      worker.on("exit", (code) => {
        if (code !== 0) {
          logger.error(`Worker stopped with exit code ${code}`);
        }
        this.workerPool = this.workerPool.filter((w) => w !== worker);
      });
    } else {
      logger.info("All workers are busy, retrying...");
      setTimeout(() => this.handleSwap(eventData, mongoConnector), 1000);
    }
  }
}
