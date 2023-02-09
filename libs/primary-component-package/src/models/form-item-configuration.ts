import { IComponentConfiguration } from '@lowcode-engine/core';
import { GridSystemSection } from '@lowcode-engine/component-configuration-shared';

export interface IFormItemConfiguration extends IComponentConfiguration {
  placeholder?: string;
  // 绑定的业务对象字段
  field?: string;
}

export interface ITextComponentConfiguration extends IFormItemConfiguration {
  max?: number;
  min?: number;
}

export interface INumberComponentConfiguration extends IFormItemConfiguration {
  max?: number;
  min?: number;
  step?: number;
  precision?: number;
}