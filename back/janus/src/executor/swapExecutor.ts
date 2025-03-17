import { Kafka, Consumer } from "kafkajs";
import { Environment } from "../environment";
import { MongoDbConnector } from "../infra/mongoConnector";
import { logger } from "../logger";
import { http, createWalletClient, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { berachainTestnetbArtio } from "viem/chains";

export class SwapExecutor {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: "janus",
      brokers: Environment.KAFKA_BROKERS.split(","),
    });
    this.consumer = this.kafka.consumer({ groupId: "janus-group" });
  }

  public async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: Environment.KAFKA_TOPIC });

    this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("Received message:", {
          topic,
          partition,
          key: message.key ? message.key.toString() : null,
          value: message.value ? message.value.toString() : null,
        });
        if (message.value) {
          const eventData = JSON.parse(message.value.toString());
          await this.handleSwap(eventData);
        }
      },
    });

    logger.info("Listening to Swap Orders...");
  }

  private async handleSwap(eventData: any) {
    const mongoConnector = await MongoDbConnector.getInstance();
    const privateKey = Environment.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Private key not found in environment variables");
    }

    const account = privateKeyToAccount(`0x${privateKey}`);
    const client = createWalletClient({
      chain: berachainTestnetbArtio,
      transport: http(),
      account,
    }).extend(publicActions);

    const publicApiUrl = new URL(
      `${Environment.OOGABOOGA_PUBLIC_API_URL}/v1/swap`
    );
    publicApiUrl.searchParams.set("tokenIn", eventData.tokenIn);
    publicApiUrl.searchParams.set("amount", eventData.amountIn);
    publicApiUrl.searchParams.set("tokenOut", eventData.tokenOut);
    publicApiUrl.searchParams.set("slippage", eventData.slippage);
    publicApiUrl.searchParams.set("to", eventData.userAddress);

    const res = await fetch(publicApiUrl, {
      headers: {
        Authorization: `Bearer ${Environment.OOGABOOGA_BEARER_TOKEN}`,
      },
    });

    console.log("Received response from public API", res);

    if (res.status === 200) {
      const { tx } = await res.json();

      try {
        const gas = await client.estimateGas({
          account: tx.from,
          to: tx.to,
          data: tx.data,
          value: tx.value ? BigInt(tx.value) : 0n,
        });

        // Add 10% gas buffer
        const gasWithBuffer = (gas * 11n) / 10n;

        const hash = await client.sendTransaction({
          from: tx.from,
          to: tx.to,
          data: tx.data,
          value: tx.value ? BigInt(tx.value) : 0n,
          gas: gasWithBuffer,
        });

        const rcpt = await client.waitForTransactionReceipt({
          hash,
        });

        const block = await client.getBlock({
          blockHash: rcpt.blockHash,
        });

        const swapOrderCollection = mongoConnector.getSwapOrders();

        const swapOrder = {
          amountIn: eventData.amountIn,
          amountOut: eventData.amountOut,
          slippage: eventData.slippage,
          executionTime: Number(block.timestamp),
          status: rcpt.status,
          txHash: hash,
        };

        await swapOrderCollection.findOneAndUpdate(
          {
            tokenIn: eventData.tokenIn,
            tokenOut: eventData.tokenOut,
            userAddress: eventData.userAddress,
            scheduledTime: eventData.scheduledTime,
          },
          { $set: swapOrder }
        );
      } catch (error: any) {
        // If the executor runs out of funds, mark the order as InsufficientFunds since the method estimateGas will throw an error
        if (error.message.includes("insufficient funds")) {
          const swapOrderCollection = mongoConnector.getSwapOrders();

          const swapOrder = {
            executionTime: Date.now(),
            status: "InsufficientFunds",
            txHash: null,
          };

          await swapOrderCollection.findOneAndUpdate(
            {
              tokenIn: eventData.tokenIn,
              tokenOut: eventData.tokenOut,
              userAddress: eventData.userAddress,
              scheduledTime: eventData.scheduledTime,
            },
            { $set: swapOrder }
          );

          return;
        }
        else {
          throw new Error("Error in transaction" + error.message);
        }
      }
    } else {
      throw new Error("Error in transaction" + (await res.text()));
    }
  }
}
