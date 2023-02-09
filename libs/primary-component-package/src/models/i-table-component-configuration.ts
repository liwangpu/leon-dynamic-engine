import { IComponentConfiguration } from '@lowcode-engine/core';

export interface ITableComponentConfiguration extends IComponentConfiguration {
  columns?: Array<IComponentConfiguration>;
  operators?: Array<IComponentConfiguration>;
  operatorColumn?: Array<IComponentConfiguration>;
  enableOperator?: boolean;
  lineNumber?: boolean;
}