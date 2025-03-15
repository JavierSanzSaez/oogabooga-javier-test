import { ApiProperty } from '@nestjs/swagger';

export class PlaceTWAPSwapRequestDTO {
  @ApiProperty({
    description: 'Address of the token to swap in',
  })
  tokenIn: string;

  @ApiProperty({
    description: 'Address of the token to swap out',
  })
  tokenOut: string;

  @ApiProperty({
    description: 'Array of token amounts (in Wei) to swap per split order',
  })
  amounts: string[];

  @ApiProperty({
    description: 'Array of timestamps at which to execute the split orders',
  })
  schedule: string[];
  @ApiProperty({
    description: 'Address of ',
  })
  userAddress: string;
}

export class GetTWAPSwapRequestDTO {
  @ApiProperty({
    description: 'Address of the user',
  })
  userAddress: string;

  @ApiProperty({
    description: 'Start date to filter orders',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date to filter orders',
  })
  endDate: string;

  @ApiProperty({
    description: 'Page number',
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
  })
  limit: number;
}
