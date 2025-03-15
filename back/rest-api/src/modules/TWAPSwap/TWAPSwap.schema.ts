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

  @Prop({ required: true, type: Date })
  scheduledTime: Date;

  @Prop({ type: Date })
  executionTime: Date;

  @Prop({ required: true })
  userAddress: string;

  @Prop({ required: true })
  status: string;

  txHash: string;
}

export const TWAPSwapOrderSchema = SchemaFactory.createForClass(TWAPSwapOrder);
