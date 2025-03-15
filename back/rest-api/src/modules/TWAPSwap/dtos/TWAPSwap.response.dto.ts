type TWAPSwapOrder = {
    tokenIn: string;
    tokenOut: string;
    amount: string;
    scheduledTime: string;
    userAddress: string;
    status: string;
    txHash: string;
}

export class GetTWAPSwapResponseDTO {
    orders: TWAPSwapOrder[];
    total: number;
}