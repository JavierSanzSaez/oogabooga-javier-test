import dotenv from "dotenv"

dotenv.config()

export class Environment {
    static readonly PRODUCTION = process.env.PRODUCTION === "true" || false

    static readonly MONGO_DB_CONNECTION_STRING = process.env.MONGO_DB_CONNECTION_STRING || ""
    static readonly MONGO_DB_NAME = process.env.MONGO_DB_NAME || ""
  
    static readonly BERACHAIN_RPC_HTTP = process.env.BERACHAIN_RPC_HTTP || ""
    static readonly BERACHAIN_RPC_WS = process.env.BERACHAIN_RPC_WS || ""
  
    static readonly OOGABOOGA_ROUTER_CONTRACT_ADDRESS = process.env.OOGABOOGA_ROUTER_CONTRACT_ADDRESS || ""

    static readonly WEBSITES_PORT = process.env.WEBSITES_PORT || 7777

}