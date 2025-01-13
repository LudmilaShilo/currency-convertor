import { IsNumber, IsNotEmpty, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  SupportedCurrencies,
  TargetCurrency,
} from '../enums/supported-currencies.enum';

export class ConvertCurrencyDto {
  @ApiProperty({ example: 'USD', description: 'Source currency' })
  @IsNotEmpty()
  @IsEnum(SupportedCurrencies, {
    message: 'Source currency must be one of: USD, EUR, UAH',
  })
  sourceCurrency: string;

  @ApiProperty({ example: 'UAH', description: 'Target currency' })
  @IsNotEmpty()
  @IsEnum(TargetCurrency, {
    message: 'Target currency must: UAH',
  })
  targetCurrency: string;

  @ApiProperty({ example: 100, description: 'Amount to convert' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01, { message: 'Amount must be a positive number greater than 0' })
  amount: number;
}

export class ConversionResult {
  sourceCurrency: string;
  targetCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
}
