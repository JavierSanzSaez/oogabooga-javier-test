import { Environment } from "./environment";
import { MongoDbConnector } from "./infra/mongoConnector";
import { SwapScheduler } from "./scheduler/swapScheduler";

async function bootstrap() {
  const dbConnector = await MongoDbConnector.getInstance();

  const swapScheduler = new SwapScheduler(
    dbConnector,
    Environment.KAFKA_CLIENT_ID,
    Environment.KAFKA_BROKERS.split(","),
    Environment.KAFKA_TOPIC
  );

  swapScheduler.startScheduling();
}

bootstrap().catch((err) => {
  console.error("Error starting the event listener:", err);
});
