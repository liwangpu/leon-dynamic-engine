import { IComponentConfiguration } from '../models';
import * as _ from 'lodash';

/**
 * 副作用基础过滤条件
 */
export interface IBaseEffectFilter {
  /**
   * 组件类型
   */
  type?: string | Array<string>;
  /**
   * 父组件类型
   */
  parentType?: string | Array<string>;
  /**
   * 插槽属性
   */
  slot?: string | Array<string>;
}

/**
 * 基础副作用处理器执行所处的组件环境
 */
export interface IBaseEffectContext {
  type: string;
  /**
   * 父组件类型
   */
  parentType?: string;
  /**
   * 插槽属性
   */
  slot?: string;
}

/**
 * 基础副作用执行器参数
 */
export interface IBaseEffectParam<CurrentComponent = IComponentConfiguration, ParentComponent = IComponentConfiguration> {
  /**
 * 当前组件配置
 */
  current: CurrentComponent;
  /**
   * 父组件配置
   */
  parent?: ParentComponent;
  /**
   * 插槽属性
   */
  slot?: string;
}

export class EffectHandlerStorage<Handler = (...args) => any, Filter extends IBaseEffectFilter = IBaseEffectFilter, Context extends IBaseEffectContext = IBaseEffectContext> {

  private readonly funcs: Array<[Filter, Handler]> = [];
  public constructor(protected preCompare?: (filter: Filter, context: Context) => boolean) { }

  public add(filter: Filter, func: Handler) {
    if (!filter || !_.isFunction(func)) { return; }

    this.funcs.push([filter, func]);
  }

  public get(context: Context): Array<Handler> {
    if (!context) { return []; }

    const matchedHandlers: Array<Handler> = [];
    for (const [filter, handler] of this.funcs) {
      if (_.isFunction(this.preCompare)) {
        if (!this.preCompare(filter, context)) {
          continue;
        }
      }

      let parentTypeMatched = true;

      if (filter.parentType && context.parentType) {
        if (_.isArray(filter.parentType)) {
          parentTypeMatched = (filter.parentType as Array<string>).some(t => t === context.parentType);
        } else {
          parentTypeMatched = (filter.parentType as string) === context.parentType;
        }
      }

      let slotMatched = true;
      if (filter.slot && context.slot) {
        if (_.isArray(filter.slot)) {
          slotMatched = (filter.slot as Array<string>).some(t => t === context.slot);
        } else {
          slotMatched = (filter.slot as string) === context.slot;
        }
      }

      let currentTypeMatched = true;
      if (filter.type && context.type) {
        if (_.isArray(filter.type)) {
          currentTypeMatched = (filter.type as Array<string>).some(t => t === context.type);
        } else {
          currentTypeMatched = (filter.type as string) === context.type;
        }
      }

      if (parentTypeMatched && slotMatched && currentTypeMatched) {
        matchedHandlers.push(handler);
      }
    }

    return matchedHandlers;
  }

  public getAll(): Array<[Filter, Handler]> {
    return this.funcs;
  }

}