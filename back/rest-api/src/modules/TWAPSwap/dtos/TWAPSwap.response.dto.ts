export class GetTWAPSwapResponseDTO {
    tokenIn: string;
    tokenOut: string;
    amounts: string[];
    schedule: string[];
    userAddress: string;
    status: string;
    txHash: string;
}