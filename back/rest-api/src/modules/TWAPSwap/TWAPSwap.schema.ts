import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TWAPSwapOrder extends Document {
  @Prop({ required: true })
  tokenIn: string;

  @Prop({ required: true })
  tokenOut: string;

  @Prop({ required: true })
  amountIn: string;

  amountOut: string;

  slippage: string;

  @Prop({ required: true })
  scheduledTime: string;

  executionTime: string;

  @Prop({ required: true })
  userAddress: string;

  @Prop({ required: true })
  status: string;

  txHash: string;

  @Prop({ required: true })
  swapOrderNonce: number;
}

export const TWAPSwapOrderSchema = SchemaFactory.createForClass(TWAPSwapOrder);
