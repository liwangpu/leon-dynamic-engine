import { IProjectSchema } from '@tiangong/core';

export interface IProjectManager {

  import(schema: IProjectSchema): void;

  export(): IProjectSchema;
}