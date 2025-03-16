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
    description: 'Start date to filter orders (Timestamp)',
    required: false,
  })
  startDate: string;

  @ApiProperty({
    description: 'End date to filter orders (Timestamp)',
    required: false,
  })
  endDate: string;

  @ApiProperty({
    description: 'Page number',
    default: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page. Max allowed: 100',
    default: 10,
  })
  limit: number;
}

export class CheckAllowanceRequestDTO {
  @ApiProperty({
    description: 'Address of the token to check allowance for',
  })
  tokenAddress: string;

  @ApiProperty({
    description: 'Address of the owner of the token',
  })
  owner: string;

  @ApiProperty({
    description: 'Amount to check allowance for',
  })
  amount: string;
}

export class SetAllowanceForTWAPSwapRequestDTO {
  @ApiProperty({
    description: 'Address of the token to grant allowance',
  })
  tokenAddress: string;

  @ApiProperty({
    description: 'Address of the owner of the token',
  })
  owner: string;

  @ApiProperty({
    description: 'Amount of tokens to grant allowance',
  })
  amount: string;
}
