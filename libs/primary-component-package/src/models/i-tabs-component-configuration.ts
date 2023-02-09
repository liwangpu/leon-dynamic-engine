import { IComponentConfiguration } from '@lowcode-engine/core';

export interface ITabsComponentConfiguration extends IComponentConfiguration {
  items?: Array<IComponentConfiguration>;
}