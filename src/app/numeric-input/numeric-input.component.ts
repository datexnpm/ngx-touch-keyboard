import { Component, forwardRef, Input, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-numeric-input',
  templateUrl: './numeric-input.component.html',
  styleUrls: ['./numeric-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumericInputComponent),
      multi: true
    }
  ]
})
export class NumericInputComponent implements ControlValueAccessor {
  @Input() min?: number;
  @Input() max?: number;
  @Input() step: number = 1;

  value: string = '';
  focused: boolean = false;

  private onChange = (value: number | null) => {};
  private onTouched = () => {};

  
  writeValue(value: number | null): void {
    this.value = value != null ? value.toString() : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private parseValue(val: string): number | null {
    let num = parseFloat(val);
    if (isNaN(num)) return null;
    if (this.min != null) num = Math.max(num, this.min);
    if (this.max != null) num = Math.min(num, this.max);
    return num;
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value;

    // Allow only digits, dot, minus
    val = val.replace(/[^0-9.-]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    if (val.indexOf('-') > 0) val = val.replace('-', '');

    this.value = val;
    this.onChange(this.parseValue(val));
  }

  onBlur() {
    this.focused = false;
    this.onTouched();
  }

  onFocus() {
    this.focused = true;
  }

  increment(event?: MouseEvent) {
  if (event) event.preventDefault(); // prevent button from stealing focus
  let num = this.parseValue(this.value) ?? 0;
  num += this.step;
  if (this.max != null) num = Math.min(num, this.max);
  this.value = num.toString();
  this.onChange(num);
}

decrement(event?: MouseEvent) {
  if (event) event.preventDefault(); // prevent button from stealing focus
  let num = this.parseValue(this.value) ?? 0;
  num -= this.step;
  if (this.min != null) num = Math.max(num, this.min);
  this.value = num.toString();
  this.onChange(num);
}

 @HostListener('keydown', ['$event'])
handleKeyDown(event: KeyboardEvent) {
  const allowedKeys = [
    'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'Home', 'End'
  ];

  const numberKeys = '0123456789';
  const isNumber = numberKeys.includes(event.key);
  const isMinus = event.key === '-' && this.value.indexOf('-') === -1 && event.target instanceof HTMLInputElement && (event.target.selectionStart === 0);
  const isDot = event.key === '.' && this.value.indexOf('.') === -1;

  if (!isNumber && !isMinus && !isDot && !allowedKeys.includes(event.key)) {
    event.preventDefault(); // block invalid keys
  }

  // Handle arrow keys for increment/decrement
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    this.increment();
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    this.decrement();
  }
}
}