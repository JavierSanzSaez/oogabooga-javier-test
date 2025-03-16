type TWAPSwapOrder = {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  slippage: string;
  scheduledTime: Date;
  executionTime: Date;
  userAddress: string;
  status: string;
  txHash: string;
};

export class GetTWAPSwapResponseDTO {
  orders: TWAPSwapOrder[];
  total: number;
}

export class CheckAllowanceResponseDTO {
  quantity: string;
  allowed: boolean;
}

export class SetAllowanceForTWAPSwapResponseDTO {
  to: string;
  data: string;
  from: string;
}
