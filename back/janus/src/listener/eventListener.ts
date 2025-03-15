import { Environment } from "../environment";
import { ethers, JsonRpcProvider, WebSocketProvider } from "ethers";
import { MongoDbConnector } from "../infra/mongoConnector";

export class EventListener {
  private wsProvider: WebSocketProvider;
  private rpcProvider: JsonRpcProvider;

  private swapEvent = {
    address: Environment.OOGABOOGA_ROUTER_CONTRACT_ADDRESS,
    topics: [
      //event Swap(address indexed sender,
      //    uint256 inputAmount,
      //    address indexed inputToken,
      //    uint256 amountOut,
      //    address indexed outputToken,
      //    int256 slippage,
      //    uint32 referralCode,
      //    address to);
      ethers.id(
        "Swap(address,uint256,address,uint256,address,int256,uint32,address)"
      ),
    ],
  };

  constructor() {
    this.wsProvider = new ethers.WebSocketProvider(
      Environment.BERACHAIN_RPC_WS
    );
    this.rpcProvider = new ethers.JsonRpcProvider(
      Environment.BERACHAIN_RPC_HTTP
    );
  }

  public async startListening(mongoConnector: MongoDbConnector): Promise<void> {
    this.wsProvider.on(this.swapEvent, (eventData: any) =>
      this.handleSwap(eventData, mongoConnector)
    );
    console.log(`Listening for Swap Order events...`);
  }

  private handleSwap(eventData: any, mongoConnector: MongoDbConnector): void {
    const swapOrderCollection = mongoConnector.getSwapOrders();

    const swapOrder = {
        tokenIn: eventData.topics[2],
        tokenOut: eventData.topics[4],
        amountIn: eventData.topics[3],
        amountOut: eventData.topics[5],
        executionTime: Date.now().toString(),
    };

    swapOrderCollection.findOneAndUpdate(
      { tokenIn: swapOrder.tokenIn, tokenOut: swapOrder.tokenOut },
      { $set: swapOrder }
    );

    // Process the incoming event data
    console.log("Event received:", eventData);
    // Add your event handling logic here
  }
}
