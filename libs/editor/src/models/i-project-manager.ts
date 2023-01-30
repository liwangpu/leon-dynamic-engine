import { IProjectSchema } from '@tiangong/core';
import { IDisposer } from 'mobx-state-tree';

export interface IProjectManager {
  import(schema: IProjectSchema): void;
  export(): IProjectSchema;
  monitorSchema(onChange: (schema: IProjectSchema) => void): IDisposer;
}