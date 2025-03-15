import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import { TWAPSwapService } from "./TWAPSwap.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { TWAPSwapRequestDTO } from "./dtos/TWAPSwap.request.dto";

@ApiTags("TWAP Swap")
@Controller("twap-swap")
export class TWAPSwapController {
  constructor(private readonly twapSwapService: TWAPSwapService) {}

  @Post("placeTwapSwapOrder")
  @ApiOperation({ summary: "Place TWAP Swap Order" })
  async placeTwapSwapOrder(@Body() body: TWAPSwapRequestDTO) {
    if (body.amounts.length != body.schedule.length) {
      throw new BadRequestException(
        "Amounts and tokens must have the same length"
      );
    }
    if (
      body.tokenIn === "" ||
      body.tokenOut === "" ||
      body.userAddress === ""
    ) {
      throw new BadRequestException(
        "TokenIn, TokenOut and UserAddress must not be empty"
      );
    }

    return this.twapSwapService.placeTwapSwapOrder(body);
  }
}
