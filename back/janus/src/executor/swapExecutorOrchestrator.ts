import { Kafka, Consumer } from "kafkajs";
import { Environment } from "../environment";
import { MongoDbConnector } from "../infra/mongoConnector";
import path from "path";
import { Worker } from "worker_threads";

export class SwapExecutorOrchestrator {
  private kafka: Kafka;
  private consumer: Consumer;
  private workerPool: Worker[] = [];
  private maxWorkers: number = 10;

  constructor() {
    this.kafka = new Kafka({
      clientId: "janus",
      brokers: [Environment.KAFKA_BROKER],
    });
    this.consumer = this.kafka.consumer({ groupId: "janus-group" });
  }

  public async start(mongoConnector: MongoDbConnector) {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: "swap-orders" });

    this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (message.value) {
          const eventData = JSON.parse(message.value.toString());
          this.handleSwap(eventData, mongoConnector);
        }
      },
    });

    console.log(`Listening for Swap Order events...`);
  }

  private async handleSwap(eventData: any, mongoConnector: MongoDbConnector) {
    if (this.workerPool.length < this.maxWorkers) {
      const worker = new Worker(
        path.resolve(__dirname, "./swapExecutorWorker.ts"),
        {
          workerData: { eventData, mongoConnector },
        }
      );
      this.workerPool.push(worker);

      worker.on("message", (result) => {
        console.log("Worker result:", result);
        this.workerPool = this.workerPool.filter((w) => w !== worker);
      });

      worker.on("error", (error) => {
        console.error("Worker error:", error);
        this.workerPool = this.workerPool.filter((w) => w !== worker);
      });

      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
        }
        this.workerPool = this.workerPool.filter((w) => w !== worker);
      });
    } else {
      console.log("All workers are busy, retrying...");
      setTimeout(() => this.handleSwap(eventData, mongoConnector), 1000);
    }
  }
}
