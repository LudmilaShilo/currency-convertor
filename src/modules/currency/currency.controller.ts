import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import {
  ConvertCurrencyDto,
  ConversionResult,
} from './dto/convert-currency.dto';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';

@ApiTags('currency')
@Controller('currency')
@UseGuards(RateLimitGuard)
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('convert')
  async convertCurrency(
    @Body() dto: ConvertCurrencyDto,
  ): Promise<ConversionResult> {
    return this.currencyService.convertCurrency(dto);
  }
}
