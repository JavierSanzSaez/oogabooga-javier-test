import { Environment } from "./environment";
import { SwapExecutor } from "./executor/swapExecutor";
import { MongoDbConnector } from "./infra/mongoConnector";
import { logger } from "./logger";
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

  const swapExecutor = new SwapExecutor();

  swapExecutor.start();

  logger.info("Janus operative. Scheduler started.");
}

bootstrap().catch((err) => {
  logger.error("Error while executing Janus", err);
});
