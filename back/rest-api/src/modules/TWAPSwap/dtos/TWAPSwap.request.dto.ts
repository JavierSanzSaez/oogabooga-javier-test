import { ApiProperty } from "@nestjs/swagger";

export class TWAPSwapRequestDTO {
  @ApiProperty({
    description: "Address of the token to swap in",
  })
  tokenIn!: string;

  @ApiProperty({
    description: "Address of the token to swap out",
  })
  tokenOut!: string;

  @ApiProperty({
    description: "Array of token amounts (in Wei) to swap per split order",
  })
  amounts!: string[];

  @ApiProperty({
    description: "Array of timestamps at which to execute the split orders",
  })
  schedule!: string[];
  @ApiProperty({
    description: "Address of ",
  })
  userAddress!: string;
}
