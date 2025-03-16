import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { TWAPSwapService } from './TWAPSwap.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CheckAllowanceRequestDTO,
  GetTWAPSwapRequestDTO,
  PlaceTWAPSwapRequestDTO,
  SetAllowanceForTWAPSwapRequestDTO,
} from './dtos/TWAPSwap.request.dto';
import { BigNumber } from 'bignumber.js';
import {
  CheckAllowanceResponseDTO,
  GetTWAPSwapResponseDTO,
  SetAllowanceForTWAPSwapResponseDTO,
} from './dtos/TWAPSwap.response.dto';

@ApiTags('TWAP Swap')
@Controller('twap-swap')
export class TWAPSwapController {
  constructor(private readonly twapSwapService: TWAPSwapService) {}

  @Post('placeTwapSwapOrder')
  @ApiOperation({ summary: 'Place TWAP Swap Order' })
  async placeTwapSwapOrder(@Body() body: PlaceTWAPSwapRequestDTO) {
    if (body.amounts.length != body.schedule.length) {
      throw new BadRequestException(
        'Amounts and tokens must have the same length',
      );
    }
    if (
      body.tokenIn === '' ||
      body.tokenOut === '' ||
      body.userAddress === ''
    ) {
      throw new BadRequestException(
        'TokenIn, TokenOut and UserAddress must not be empty',
      );
    }
    if (body.amounts.length === 0 || body.schedule.length === 0) {
      throw new BadRequestException('Amounts and Schedule must not be empty');
    }

    if (
      body.amounts.some((amount) => {
        try {
          new BigNumber(amount);
          return false;
        } catch (e) {
          return true;
        }
      })
    ) {
      throw new BadRequestException('Amounts must be valid numbers');
    }
    if (
      body.schedule.some((timestamp) =>
        isNaN(Number(new Date(Number(timestamp) * 1000))),
      )
    ) {
      throw new BadRequestException('Schedule must be valid timestamps');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.userAddress)) {
      throw new BadRequestException('UserAddress must be a valid EVM address');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.tokenIn)) {
      throw new BadRequestException('TokenIn must be a valid EVM address');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.tokenOut)) {
      throw new BadRequestException('TokenOut must be a valid EVM address');
    }

    const scheduleDates = body.schedule.map((timestamp) => new Date(Number(timestamp) * 1000));

    try {
      const totalAmount = body.amounts.reduce(
        (acc, amount) => acc.plus(new BigNumber(amount)),
        new BigNumber(0),
      );
      const allowance = await this.twapSwapService.checkAllowance({
        tokenAddress: body.tokenIn,
        owner: body.userAddress,
        amount: totalAmount.toString(),
      });

      if (!allowance.allowed) {
        throw new BadRequestException(
          `Insufficient allowance, requested ${totalAmount.toString()} butcurrently ${allowance.quantity.toString()} allowed`,
        );
      }

      await this.twapSwapService.placeTwapSwapOrder({
        ...body,
        schedule: scheduleDates,
      });
    } catch (e) {
      throw new BadRequestException((e as any).message);
    }
  }

  @Get('getTwapSwapOrders')
  @ApiOperation({ summary: 'Get TWAP Swap Orders' })
  async getTwapSwapOrders(
    @Query() query: GetTWAPSwapRequestDTO,
  ): Promise<GetTWAPSwapResponseDTO> {
    if (query.userAddress === '') {
      throw new BadRequestException('UserAddress must not be empty');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(query.userAddress)) {
      throw new BadRequestException('UserAddress must be a valid EVM address');
    }
    if (query.page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (query.limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    const orders = await this.twapSwapService.getTwapSwapOrders(query);

    return {
      orders,
      total: orders.length,
    };
  }

  @Get('checkAllowance')
  @ApiOperation({ summary: 'Check Allowance' })
  async checkAllowance(
    @Query() query: CheckAllowanceRequestDTO,
  ): Promise<CheckAllowanceResponseDTO> {
    if (query.tokenAddress === '' || query.owner === '') {
      throw new BadRequestException('TokenAddress and Owner must not be empty');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(query.tokenAddress)) {
      throw new BadRequestException('TokenAddress must be a valid EVM address');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(query.owner)) {
      throw new BadRequestException('Owner must be a valid EVM address');
    }
    if (query.amount === '') {
      throw new BadRequestException('Amount must not be empty');
    }
    if (isNaN(Number(query.amount))) {
      throw new BadRequestException('Amount must be a valid number');
    }

    return await this.twapSwapService.checkAllowance(query);
  }

  @Post('setAllowanceForTWAPSwap')
  @ApiOperation({ summary: 'Set Allowance for TWAP Swap' })
  async setAllowanceForTWAPSwap(
    @Body() body: SetAllowanceForTWAPSwapRequestDTO,
  ): Promise<SetAllowanceForTWAPSwapResponseDTO> {
    if (body.tokenAddress === '' || body.owner === '') {
      throw new BadRequestException('TokenAddress and Owner must not be empty');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.tokenAddress)) {
      throw new BadRequestException('TokenAddress must be a valid EVM address');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.owner)) {
      throw new BadRequestException('Owner must be a valid EVM address');
    }

    return await this.twapSwapService.setAllowanceForTWAPSwap(body);
  }
}
