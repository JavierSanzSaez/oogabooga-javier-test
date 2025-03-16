import dotenv from "dotenv";

dotenv.config();

export class Environment {
  static readonly PRODUCTION = process.env.PRODUCTION === "true" || false;

  static readonly MONGO_DB_CONNECTION_STRING =
    process.env.MONGO_DB_CONNECTION_STRING || "";
  static readonly MONGO_DB_NAME = process.env.MONGO_DB_NAME || "";

  static readonly BERACHAIN_RPC_HTTP = process.env.BERACHAIN_RPC_HTTP || "";
  static readonly BERACHAIN_RPC_WS = process.env.BERACHAIN_RPC_WS || "";
  static readonly PRIVATE_KEY = process.env.PRIVATE_KEY || "";

  static readonly KAFKA_BROKERS = process.env.KAFKA_BROKERS || "";
  static readonly KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "";
  static readonly KAFKA_TOPIC = process.env.KAFKA_TOPIC || "";

  static readonly OOGABOOGA_ROUTER_CONTRACT_ADDRESS =
    process.env.OOGABOOGA_ROUTER_CONTRACT_ADDRESS || "";
  static readonly OOGABOOGA_PUBLIC_API_URL =
    process.env.OOGABOOGA_PUBLIC_API_URL || "";
  static readonly OOGABOOGA_BEARER_TOKEN =
    process.env.OOGABOOGA_BEARER_TOKEN || "";

  static readonly WEBSITES_PORT = process.env.WEBSITES_PORT || 7777;
}
