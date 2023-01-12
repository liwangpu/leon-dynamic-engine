import { IComponentConfiguration } from '@tiangong/core';

export interface ITableComponentConfiguration extends IComponentConfiguration {
  columns: Array<IComponentConfiguration>;
  operators?: Array<IComponentConfiguration>;
  operatorColumn?: Array<IComponentConfiguration>;
}