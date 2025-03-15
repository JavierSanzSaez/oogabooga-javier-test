import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { TWAPSwapService } from './TWAPSwap.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetTWAPSwapRequestDTO, PlaceTWAPSwapRequestDTO } from './dtos/TWAPSwap.request.dto';
import { BigNumber } from 'bignumber.js';
import { GetTWAPSwapResponseDTO } from './dtos/TWAPSwap.response.dto';

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
    if (body.schedule.some((timestamp) => isNaN(Date.parse(timestamp)))) {
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

    return this.twapSwapService.placeTwapSwapOrder(body);
  }

  @Get('getTwapSwapOrders')
  @ApiOperation({ summary: 'Get TWAP Swap Orders' })
  async getTwapSwapOrders(
    @Body() body: GetTWAPSwapRequestDTO,
  ): Promise<GetTWAPSwapResponseDTO> {
    if (body.userAddress === '') {
      throw new BadRequestException('UserAddress must not be empty');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.userAddress)) {
      throw new BadRequestException('UserAddress must be a valid EVM address');
    }

    const orders = this.twapSwapService.getTwapSwapOrders(body);

    return orders;
  }
}
