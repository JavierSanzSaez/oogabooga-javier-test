import { MongoClient } from 'mongodb';
import { logger } from '../logger';
import { Environment } from '../environment';

export class MongoDbConnector {
  private static instance: MongoDbConnector;
  private mongoClient: MongoClient;
  private mongoDbName: string;

  private constructor() {
    this.mongoClient = new MongoClient(Environment.MONGO_DB_CONNECTION_STRING);
    this.mongoDbName = Environment.MONGO_DB_NAME;
  }

  public static async getInstance() {
    if (!MongoDbConnector.instance) {
      MongoDbConnector.instance = new MongoDbConnector();

      try {
        await MongoDbConnector.instance.mongoClient.connect();
        logger.info('Successfully connected to MongoDb');
      } catch (error) {
        logger.error('Connection to MongoDb failed', error);
        process.exit();
      }
    }
    return MongoDbConnector.instance;
  }

  public getMongoClient() {
    return this.mongoClient;
  }

  public getSwapOrders() {
    return this.mongoClient.db(this.mongoDbName).collection('twapswaporders');
  }



}
