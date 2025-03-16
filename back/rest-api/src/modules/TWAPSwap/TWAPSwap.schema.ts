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

  @Prop({ required: true, type: Number })
  scheduledTime: number;

  @Prop({ type: Number })
  executionTime: number;

  @Prop({ required: true })
  userAddress: string;

  @Prop({ required: true })
  status: string;

  txHash: string;
}

export const TWAPSwapOrderSchema = SchemaFactory.createForClass(TWAPSwapOrder);
