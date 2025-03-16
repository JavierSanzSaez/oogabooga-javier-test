import { parentPort, workerData } from "worker_threads";
import { MongoDbConnector } from "../infra/mongoConnector";
import { Environment } from "../environment";

import { http, type Address, createWalletClient, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { berachainTestnetbArtio } from "viem/chains";

const { eventData, mongoConnector } = workerData;

const handleSwap = async (eventData: any, mongoConnector: MongoDbConnector) => {
  const privateKey = Environment.PRIVATE_KEY as Address;
  if (!privateKey) {
    throw new Error("Private key not found in environment variables");
  }

  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({
    chain: berachainTestnetbArtio,
    transport: http(),
    account,
  }).extend(publicActions);

  const publicApiUrl = new URL(
    `${Environment.OOGABOOGA_PUBLIC_API_URL}/v1/swap`
  );
  publicApiUrl.searchParams.set("tokenIn", eventData.tokenIn);
  publicApiUrl.searchParams.set("amount", eventData.amount);
  publicApiUrl.searchParams.set("tokenOut", eventData.tokenOut);
  publicApiUrl.searchParams.set("slippage", eventData.slippage);
  publicApiUrl.searchParams.set("to", eventData.userAddress);

  const res = await fetch(publicApiUrl, {
    headers: { Authorization: `Bearer ${Environment.OOGABOOGA_BEARER_TOKEN}` },
  });

  if (res.status === 200) {
    const { tx } = await res.json();

    const gas = await client.estimateGas({
      account: tx.from as Address,
      to: tx.to as Address,
      data: tx.data as `0x${string}`,
      value: tx.value ? BigInt(tx.value) : 0n,
    });

    // Add 10% gas buffer
    const gasWithBuffer = (gas * 11n) / 10n;

    const hash = await client.sendTransaction({
      from: tx.from as Address,
      to: tx.to as Address,
      data: tx.data as `0x${string}`,
      value: tx.value ? BigInt(tx.value) : 0n,
      gas: gasWithBuffer,
    });

    const rcpt = await client.waitForTransactionReceipt({
      hash,
    });

    const block = await client.getBlock({
      blockHash: rcpt.blockHash as `0x${string}`,
    });

    const swapOrderCollection = mongoConnector.getSwapOrders();

    const swapOrder = {
      amountIn: eventData.amountIn,
      amountOut: eventData.amountOut,
      slippage: eventData.slippage,
      executionTime: new Date(Number(block.timestamp) * 1000),
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
  } else {
    throw new Error("Error in transaction" + (await res.text()));
  }
  if (parentPort) {
    parentPort.postMessage(
      `${Date.now().toString()} - Swap handled successfully for ${
        eventData.userAddress
      }`
    );
  }
};

if (parentPort) {
  handleSwap(eventData, mongoConnector);
}
