import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderByDateAsc',
  standalone: true
})
export class OrderByDateAscPipe implements PipeTransform {
  transform(messages: any[]): any[] {
    if (!Array.isArray(messages)) return messages;
    return [...messages].sort((a, b) => {
      const dateA = new Date(a.created_date).getTime();
      const dateB = new Date(b.created_date).getTime();
      return dateA - dateB;
    });
  }
}
