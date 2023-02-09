import { IComponentConfiguration } from '@lowcode-engine/core';

export interface IPageComponentConfiguration extends IComponentConfiguration {
  operators?: Array<IComponentConfiguration>;
  leftArea?: IComponentConfiguration[];
  middleArea?: IComponentConfiguration[];
  rightArea?: IComponentConfiguration[];
}