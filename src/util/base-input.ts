import { ElementRef, EventEmitter, Input, Output, Renderer } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { isPresent, isArray, isTrueProperty, assert } from './util';
import { Ion } from '../components/ion';
import { Config } from '../config/config';
import { Item } from '../components/item/item';
import { Form } from './form';

export class BaseInput<T> extends Ion implements ControlValueAccessor {

  /**
   * @output {Range} Emitted when the range selector drag starts.
   */
  @Output() ionFocus: EventEmitter<BaseInput<T>> = new EventEmitter<BaseInput<T>>();

  /**
   * @output {Range} Emitted when the range value changes.
   */
  @Output() ionChange: EventEmitter<BaseInput<T>> = new EventEmitter<BaseInput<T>>();

  /**
   * @output {Range} Emitted when the range selector drag ends.
   */
  @Output() ionBlur: EventEmitter<BaseInput<T>> = new EventEmitter<BaseInput<T>>();

  _value: T;
  _onChanged: Function;
  _onTouched: Function;
  _isFocus: boolean = false;
  _labelId: string;
  _disabled: boolean = false;
  _init: boolean = false;
  id: string;

  /**
   * @input {boolean} If true, the user cannot interact with this element.
   */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(val: boolean) {
    this.setDisabledState(val);
  }

  constructor(
    config: Config,
    elementRef: ElementRef,
    renderer: Renderer,
    name: string,
    public _form: Form,
    public _item: Item,
  ) {
    super(config, elementRef, renderer, name);
    _form && _form.register(this);

    if (_item) {
      this.id = name + '-' + _item.registerInput(name);
      this._labelId = 'lbl-' + _item.id;
      this._item.setElementClass('item-' + name, true);
    }
  }

  /**
   * @hidden
   */
  ngAfterContentInit() {
    this._init = true;
  }


  get value(): T {
    return this._value;
  }
  set value(val: T) {
    if (isPresent(val) && this.value !== val) {
      this.writeValue(val);
      this.onChange(val);
    }
  }

  initFocus() {

  }

  updateInput() {

  }

  writeValue(val: any) {
    this.value = val;
    this.checkHasValue(val);
    this.updateInput();
  }

  /**
   * @hidden
   */
  registerOnChange(fn: Function) {
    this._onChanged = fn;
  }

  /**
   * @hidden
   */
  registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  protected _setFocus() {
    assert(!this._isFocus, 'input should not be focus');

    this._isFocus = true;
    this.ionFocus.emit(this);
  }

  protected _setBlur() {
    assert(!this._isFocus, 'input should not be focus');

    this._isFocus = false;
    this.ionBlur.emit(this);
  }

  private checkHasValue(val: T) {
    if (!this._item) {
      return;
    }
    let hasValue: boolean;
    if (isArray(val)) {
      // hasValue = val.length > 0;
    } else {
      hasValue = isPresent(val);
    }
    this._item.setElementClass('input-has-value', hasValue);
  }

  setDisabledState?(isDisabled: boolean) {
    this._disabled = isTrueProperty(isDisabled);
    this._item && this._item.setElementClass('item-select-disabled', isDisabled);
  }

  /**
   * @hidden
   */
  private onChange(val: T) {
    this._onChanged && this._onChanged(val);
    this._onTouched && this._onTouched();
    this.ionChange.emit(this);
  }

  ngOnDestroy() {
    this._form.deregister(this);
  }
}
