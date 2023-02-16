import { IComponentConfiguration } from '@lowcode-engine/core';
import { TableFeature } from '../enums';

export interface ITableComponentConfiguration extends IComponentConfiguration {
  columns?: Array<IComponentConfiguration>;
  operators?: Array<IComponentConfiguration>;
  operatorColumn?: Array<IComponentConfiguration>;
  features?: Array<TableFeature>;
}