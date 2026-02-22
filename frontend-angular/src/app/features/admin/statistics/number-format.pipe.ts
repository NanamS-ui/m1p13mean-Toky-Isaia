import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberFormat', standalone: true })
export class NumberFormatPipe implements PipeTransform {

  transform(value: number | string | null | undefined, decimals: number = 0): string {
    if (value === null || value === undefined || value === '') return '';

    const num = typeof value === 'string' ? Number(value) : value;
    if (isNaN(num)) return '';

    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }
}