import { IDataCenterEngine } from '@lowcode-engine/core';
import { IRendererContext } from './renderer-manager';

export class DataCenterManager implements IDataCenterEngine {

  public constructor(protected context: IRendererContext) { }

  public setData(field: string, val: any): void {
    throw new Error('Method not implemented.');
  }

  public setState(componentId: string, property: string, data?: any): void {
    this.context.store.state.setState(componentId, property, data);
  }

  public getState(componentId: string, property: string) {
    return this.context.store.state.getState(componentId, property);
  }

  public getVisible(componentId: string): boolean {
    return this.context.store.state.getVisible(componentId);
  }

}