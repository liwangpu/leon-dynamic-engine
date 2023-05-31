import { EffectHandlerStorage, IBaseEffectFilter, IBaseEffectParam } from '@lowcode-engine/core';
import { IRendererContext } from './renderer-manager';

export type IStyleEffectFilter = IBaseEffectFilter;

export type IStyleEffectParam = IBaseEffectParam;

export interface IStyleEffectHandler {
  (param: IStyleEffectParam): { [key: string]: any } | Promise<{ [key: string]: any }>;
}


export interface IStyleManager {
  registerHandler(filter: IStyleEffectFilter, handler: IStyleEffectHandler): void;
  getHandler(param: IStyleEffectParam): Array<IStyleEffectHandler>;
}

export class StyleManager implements IStyleManager {

  private readonly handlers = new EffectHandlerStorage<IStyleEffectHandler, IStyleEffectFilter>();
  public constructor(protected context: IRendererContext) {
    //
  }

  public registerHandler(filter: IBaseEffectFilter, handler: IStyleEffectHandler): void {
    this.handlers.add(filter, handler);
  }

  public getHandler(param: IStyleEffectParam): Array<IStyleEffectHandler> {
    return this.handlers.get(param);
  }


}