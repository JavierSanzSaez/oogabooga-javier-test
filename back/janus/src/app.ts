import { MongoDbConnector } from "./infra/mongoConnector";
import { EventListener } from "./listener/eventListener";

async function bootstrap() {
  const dbConnector = await MongoDbConnector.getInstance();

  const eventListener = new EventListener();
  await eventListener.startListening(dbConnector);
}

bootstrap().catch((err) => {
  console.error("Error starting the event listener:", err);
});
