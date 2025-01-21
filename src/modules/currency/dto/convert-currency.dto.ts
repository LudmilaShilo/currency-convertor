import { IsNumber, IsNotEmpty, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  SupportedCurrencies,
  TargetCurrency,
} from '../enums/supported-currencies.enum';

export class ConvertCurrencyDto {
  @ApiProperty({
    description: 'Source currency code',
    example: 'USD',
    enum: SupportedCurrencies,
  })
  @IsNotEmpty()
  @IsEnum(SupportedCurrencies)
  sourceCurrency: string;

  @ApiProperty({
    description: 'Target currency code (only UAH supported)',
    example: 'UAH',
    enum: TargetCurrency,
  })
  @IsNotEmpty()
  @IsEnum(TargetCurrency)
  targetCurrency: string;

  @ApiProperty({
    description: 'Amount to convert',
    example: 100,
    minimum: 0.01,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;
}

export class ConversionResult {
  @ApiProperty({ example: 'USD' })
  sourceCurrency: string;

  @ApiProperty({ example: 'UAH' })
  targetCurrency: string;

  @ApiProperty({ example: 100 })
  amount: number;

  @ApiProperty({ example: 3650 })
  convertedAmount: number;

  @ApiProperty({ example: 36.5 })
  rate: number;
}
