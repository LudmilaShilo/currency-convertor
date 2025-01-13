import { Controller, Post, Body } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import {
  ConvertCurrencyDto,
  ConversionResult,
} from './dto/convert-currency.dto';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('convert')
  async convertCurrency(
    @Body() dto: ConvertCurrencyDto,
  ): Promise<ConversionResult> {
    return this.currencyService.convertCurrency(dto);
  }
}
