import { IComponentConfiguration } from '@tiangong/core';

export interface ITabsComponentConfiguration extends IComponentConfiguration {
  items?: Array<IComponentConfiguration>;
}