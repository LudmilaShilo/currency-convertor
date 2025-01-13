import { ApiProperty } from '@nestjs/swagger';

export class ConvertCurrencySchema {
  @ApiProperty({
    description: 'Currency code to convert from (e.g., USD)',
    example: 'USD',
  })
  sourceCurrency: string;

  @ApiProperty({
    description: 'Currency code to convert to (e.g., UAH)',
    example: 'UAH',
  })
  targetCurrency: string;

  @ApiProperty({
    description: 'Amount to convert',
    example: 100,
  })
  amount: number;
}

export class ConversionResultSchema {
  @ApiProperty({ example: 'USD' })
  sourceCurrency: string;

  @ApiProperty({ example: 'UAH' })
  targetCurrency: string;

  @ApiProperty({ example: 100 })
  amount: number;

  @ApiProperty({ example: 42.4702 })
  convertedAmount: number;

  @ApiProperty({ example: 4247.02 })
  rate: number;
}
