import { IComponentConfiguration } from '../models';
import * as _ from 'lodash';

type FilterItem = string | Array<string>;

interface IPlacement {
  /**
   * 第一个
   */
  first?: boolean;
  /**
   * 最后一个
   */
  last?: boolean;
  /**
   * 下标
   */
  index?: number;
  /**
   * 下标为偶数
   */
  even?: boolean;
  /**
   * 下标为基数
   */
  odd?: boolean
}

const contextItemMatchFilterItem = (filterItem: FilterItem, contextItem: string) => {
  let result = true;
  if (filterItem) {
    if (contextItem) {
      if (_.isArray(filterItem)) {
        result = (filterItem as Array<string>).some(t => t === contextItem);
      } else {
        result = (filterItem as string) === contextItem;
      }
    } else {
      result = false;
    }
  }

  return result;
};

/**
 * 副作用基础过滤条件
 */
export interface IBaseEffectFilter extends IPlacement {
  /**
   * 组件类型
   */
  type?: FilterItem;
  /**
   * 父组件类型
   */
  parentType?: FilterItem;
  /**
   * 插槽属性
   */
  slot?: FilterItem;
}

/**
 * 基础副作用处理器执行所处的组件环境
 */
export interface IBaseEffectContext extends IPlacement {
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

/** z
 * 基础副作用执行器参数
 */
export interface IBaseEffectParam<CurrentComponent = IComponentConfiguration, ParentComponent = IComponentConfiguration> extends IPlacement {
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
      let parentTypeMatched = contextItemMatchFilterItem(filter.parentType, context.parentType);
      let slotMatched = contextItemMatchFilterItem(filter.slot, context.slot);
      let currentTypeMatched = contextItemMatchFilterItem(filter.type, context.type);
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