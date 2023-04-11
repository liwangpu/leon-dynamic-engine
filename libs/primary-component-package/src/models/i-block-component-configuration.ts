import { IComponentConfiguration } from '@lowcode-engine/core';

export interface IBlockComponentConfiguration extends IComponentConfiguration {
  enableCollapse?: boolean;
  collapsedRow?: number;
}