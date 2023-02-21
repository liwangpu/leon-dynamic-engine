import { IComponentConfiguration } from '@lowcode-engine/core';
import { TableFeature } from '../enums';

export interface IPaginationComponentConfiguration extends IComponentConfiguration {
  pageSize: number;
  showTotal?: boolean;
}

export interface ITableOperatorColumnComponentConfiguration extends IComponentConfiguration {
  visible?: boolean;
  children?: Array<IComponentConfiguration>;
}

export interface ISerialNumberColumnComponentConfiguration extends IComponentConfiguration {
  visible?: boolean;
  freeze?: boolean;
  export?: boolean;
}

export interface ITableComponentConfiguration extends IComponentConfiguration {
  columns?: Array<IComponentConfiguration>;
  operators?: Array<IComponentConfiguration>;
  operatorColumn?: ITableOperatorColumnComponentConfiguration;
  serialNumberColumn?: ISerialNumberColumnComponentConfiguration;
  features?: Array<TableFeature>;
  pagination?: IPaginationComponentConfiguration;
}