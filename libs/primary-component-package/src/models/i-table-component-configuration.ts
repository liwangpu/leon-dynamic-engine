import { IComponentConfiguration } from '@lowcode-engine/core';
import { TableFeature, TableSelectionMode } from '../enums';

export interface IPaginationComponentConfiguration extends IComponentConfiguration {
  pageSize: number;
  showTotal?: boolean;
}

export interface ITableOperatorColumnComponentConfiguration extends IComponentConfiguration {
  visible?: boolean;
  children?: Array<IComponentConfiguration>;
}

export interface ISelectionColumnComponentConfiguration extends IComponentConfiguration {
  selectionMode?: TableSelectionMode;
}

export interface ITableComponentConfiguration extends IComponentConfiguration {
  columns?: Array<IComponentConfiguration>;
  operators?: Array<IComponentConfiguration>;
  operatorColumn?: ITableOperatorColumnComponentConfiguration;
  selectionColumn?: ISelectionColumnComponentConfiguration;
  features?: Array<TableFeature>;
  pagination?: IPaginationComponentConfiguration;
}