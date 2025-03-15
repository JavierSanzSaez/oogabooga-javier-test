import { Injectable } from "@nestjs/common";

type TWAPSwapOrderArgs = {
  tokenIn: string;
  tokenOut: string;
  amounts: string[];
  schedule: string[];
  userAddress: string;
};

@Injectable()
export class TWAPSwapService {
  placeTwapSwapOrder({
    tokenIn,
    tokenOut,
    amounts,
    schedule,
    userAddress,
  }: TWAPSwapOrderArgs): void {
    "This action places a new twapSwap";
  }
}
