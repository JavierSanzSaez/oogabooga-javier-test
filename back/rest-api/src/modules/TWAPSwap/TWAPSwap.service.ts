import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TWAPSwapOrder } from './TWAPSwap.schema';
import { GetTWAPSwapRequestDTO } from './dtos/TWAPSwap.request.dto';

type TWAPSwapOrderArgs = {
  tokenIn: string;
  tokenOut: string;
  amounts: string[];
  schedule: string[];
  userAddress: string;
};

@Injectable()
export class TWAPSwapService {
  constructor(
    @InjectModel(TWAPSwapOrder.name)
    private readonly twapSwapModel: Model<TWAPSwapOrder>,
  ) {}

  async placeTwapSwapOrder({
    tokenIn,
    tokenOut,
    amounts,
    schedule,
    userAddress,
  }: TWAPSwapOrderArgs): Promise<void> {
    // To avoid a wrong ordering of schedules provided by the user, we sort the schedules and amounts based on the schedule time
    const sortedIndices = schedule
      .map((time, index) => ({ time, index }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map(({ index }) => index);

    schedule = sortedIndices.map((index) => schedule[index]);
    amounts = sortedIndices.map((index) => amounts[index]);

    const lastOrder = await this.twapSwapModel
      .findOne({ userAddress })
      .sort({ swapOrderNonce: -1 })
      .exec();

    const lastSwapNonce = lastOrder ? lastOrder.swapOrderNonce : 0;

    for (const [index, time] of schedule.entries()) {
      await this.twapSwapModel.create({
        tokenIn,
        tokenOut,
        amounts: amounts[index],
        scheduledTime: time,
        userAddress,
        status: 'pending',
        swapOrderNonce: lastSwapNonce + index + 1,
      });
    }
  }

  async getTwapSwapOrders({
    userAddress,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  }: GetTWAPSwapRequestDTO): Promise<TWAPSwapOrder[]> {
    const skip = (page - 1) * limit;
    const query: any = { userAddress };

    if (startDate || endDate) {
      query.scheduledTime = {};
      if (startDate) {
        query.scheduledTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.scheduledTime.$lte = new Date(endDate);
      }
    }

    return this.twapSwapModel.find(query).skip(skip).limit(limit).exec();
  }
}
