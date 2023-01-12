import { IComponentConfiguration } from '@tiangong/core';

interface FormItemConfiguration extends IComponentConfiguration {
  placeholder?: string;
  // 绑定的业务对象字段
  field?: string;
}

export interface ITextComponentConfiguration extends FormItemConfiguration {
  max?: number;
  min?: number;
}

export interface INumberComponentConfiguration extends FormItemConfiguration {
  max?: number;
  min?: number;
  step?: number;
  precision?: number;
}