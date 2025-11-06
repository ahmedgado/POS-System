import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
  pure: false
})
export class CurrencyFormatPipe implements PipeTransform {
  constructor(private settingsService: SettingsService) {}

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';

    const settings = this.settingsService.getCurrencySettings();
    const symbol = settings?.currencySymbol || '$';
    const decimalPlaces = settings?.decimalPlaces ?? 2;
    const thousandSep = settings?.thousandSeparator || ',';
    const decimalSep = settings?.decimalSeparator || '.';

    // Format number with separators
    const [integerPart, decimalPart] = value.toFixed(decimalPlaces).split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);

    return `${symbol}${formattedInteger}${decimalPart ? decimalSep + decimalPart : ''}`;
  }
}
