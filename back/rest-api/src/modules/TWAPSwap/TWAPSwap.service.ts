import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TWAPSwapOrder } from './TWAPSwap.schema';
import {
  CheckAllowanceRequestDTO,
  GetTWAPSwapRequestDTO,
  SetAllowanceForTWAPSwapRequestDTO,
} from './dtos/TWAPSwap.request.dto';

import { type Address, maxUint256, zeroAddress } from 'viem'; // Main library used to interface with the blockchain

import {
  CheckAllowanceResponseDTO,
  SetAllowanceForTWAPSwapResponseDTO,
} from './dtos/TWAPSwap.response.dto';
import { logger } from 'src/logger';

type TWAPSwapOrderArgs = {
  tokenIn: string;
  tokenOut: string;
  amounts: string[];
  schedule: Date[];
  userAddress: string;
};

@Injectable()
export class TWAPSwapService {
  constructor(
    private readonly configService: ConfigService,
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

    for (const [index, time] of schedule.entries()) {
      await this.twapSwapModel.create({
        tokenIn,
        tokenOut,
        amountIn: amounts[index],
        scheduledTime: time,
        userAddress,
        status: 'scheduled',
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
    const skip = Math.max((page - 1) * limit, 0);
    limit = Math.min(limit, 100);
    const query: any = { userAddress };

    if (startDate || endDate) {
      query.scheduledTime = {};
      if (startDate) {
        query.scheduledTime.$gte = new Date(Number(startDate) * 1000);
      }
      if (endDate) {
        query.scheduledTime.$lte = new Date(Number(endDate) * 1000);
      }
    }

    return this.twapSwapModel.find(query).skip(skip).limit(limit).exec();
  }

  async checkAllowance({
    tokenAddress,
    owner,
    amount,
  }: CheckAllowanceRequestDTO): Promise<CheckAllowanceResponseDTO> {
    const NATIVE_TOKEN: Address = zeroAddress; // Default address for Bera native token

    if (tokenAddress === NATIVE_TOKEN) {
      return {
        quantity: maxUint256.toString(),
        allowed: true,
      };
    }

    const publicApiUrl = new URL(
      `${this.configService.get<string>(
        'OOGABOOGA_PUBLIC_API_URL',
      )}/v1/approve/allowance`,
    );
    publicApiUrl.searchParams.set('token', tokenAddress);
    publicApiUrl.searchParams.set('from', owner);

    const res = await fetch(publicApiUrl, {
      headers: {
        Authorization: `Bearer ${this.configService.get<string>(
          'OOGABOOGA_BEARER_TOKEN',
        )}`,
      },
    });
    const json = await res.json();

    const allowance = BigInt(json.allowance);
    const requiredAmount = BigInt(amount);

    return {
      quantity: allowance.toString(),
      allowed: allowance >= requiredAmount,
    };
  }

  async setAllowanceForTWAPSwap({
    tokenAddress,
    owner,
    amount,
  }: SetAllowanceForTWAPSwapRequestDTO): Promise<SetAllowanceForTWAPSwapResponseDTO> {
    const approveAllowanceUrl = new URL(
      `${this.configService.get<string>(
        'OOGABOOGA_PUBLIC_API_URL',
      )}/v1/approve`,
    );
    approveAllowanceUrl.searchParams.set('token', tokenAddress);
    approveAllowanceUrl.searchParams.set('amount', amount);

    const approveAllowanceRes = await fetch(approveAllowanceUrl, {
      headers: {
        Authorization: `Bearer ${this.configService.get<string>(
          'OOGABOOGA_BEARER_TOKEN',
        )}`,
      },
    });

    if (approveAllowanceRes.status !== 200) {
      throw new Error('Failed to set allowance');
    }

    const { tx } = await approveAllowanceRes.json();

    return {
      to: tx.to,
      data: tx.data,
      from: owner,
    };
  }
}
