export interface BlockchainEvent {
    eventName: string;
    blockNumber: number;
    transactionHash: string;
    timestamp: Date;
}

export interface EventData {
    [key: string]: any; // This allows for dynamic properties based on the event
}