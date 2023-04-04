import { IComponentConfiguration } from '@lowcode-engine/core';

export interface ITabComponentConfiguration extends IComponentConfiguration {
  isDefault?: boolean;
  children?: Array<IComponentConfiguration>;
}

export interface ITabsComponentConfiguration extends IComponentConfiguration {
  defaultActiveTab?: string;
  direction?: 'horizontal' | 'vertical';
  children?: Array<ITabComponentConfiguration>;
}