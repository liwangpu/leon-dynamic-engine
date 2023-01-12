import { IComponentConfiguration } from '@tiangong/core';

export interface IPageComponentConfiguration extends IComponentConfiguration {
  operators?: Array<IComponentConfiguration>;
  leftArea?: IComponentConfiguration[];
  middleArea?: IComponentConfiguration[];
  rightArea?: IComponentConfiguration[];
}