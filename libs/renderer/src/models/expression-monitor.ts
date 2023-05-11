import { EffectHandlerStorage, IBaseEffectFilter, IBaseEffectParam } from '@lowcode-engine/core';
import { IRendererContext } from './renderer-manager';

export type IExpressionFilter = IBaseEffectFilter;

export type IExpressionParam = IBaseEffectParam;

export interface IExpressionEffect {
  key: string;
  expression: string;
  target: string;
  property: string;
}

export interface IExpressionMonitorHandler {
  (param: IExpressionParam): Array<IExpressionEffect>;
}

export interface IExpressionMonitorRegister {
  (): [IExpressionFilter, IExpressionMonitorHandler];
}

export interface IExpressionMonitorManager {
  registerMonitor(filter: IExpressionFilter, handler: IExpressionMonitorHandler): void;
  getHandler(param: IExpressionParam): Array<IExpressionMonitorHandler>;
}

export class ExpressionMonitorManager implements IExpressionMonitorManager {

  private readonly handlers = new EffectHandlerStorage<IExpressionMonitorHandler, IExpressionFilter>();
  public constructor(protected context: IRendererContext) { }

  public registerMonitor(filter: IBaseEffectFilter, handler: IExpressionMonitorHandler): void {
    this.handlers.add(filter, handler);
  }

  public getHandler(param: IExpressionParam): Array<IExpressionMonitorHandler> {
    return this.handlers.get(param);
  }

}