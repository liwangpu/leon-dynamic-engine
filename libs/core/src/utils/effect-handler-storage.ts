import { IComponentConfiguration } from '../models';
import * as _ from 'lodash';

type FilterItem = string | Array<string>;

export interface IBaseEffectPlacement {
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
   * 同级节点数量
   */
  count?: number;
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

const placementMatch = (filterPlace?: boolean | number, contextPlace?: boolean | number) => {
  if (_.isNil(filterPlace)) { return true; }

  return filterPlace === contextPlace;
};

/**
 * 副作用基础过滤条件
 */
export interface IBaseEffectFilter extends IBaseEffectPlacement {
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
 * 基础副作用执行器参数
 */
export interface IBaseEffectParam<CurrentComponent = IComponentConfiguration, ParentComponent = IComponentConfiguration> extends IBaseEffectPlacement {
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

export class EffectHandlerStorage<Handler = (...args) => any, Filter extends IBaseEffectFilter = IBaseEffectFilter, Context extends IBaseEffectParam = IBaseEffectParam> {

  private readonly funcs: Array<[Filter, Handler]> = [];
  public constructor(protected preCompare?: (filter: Filter, context: Context) => boolean) { }

  public add(filter: Filter, func: Handler) {
    if (!filter || !_.isFunction(func)) { return; }

    this.funcs.push([filter, func]);
  }

  public get(context: Context): Array<Handler> {
    if (!context) { return []; }
    const parentType = context.parent?.type;
    const currentType = context.current?.type;
    const matchedHandlers: Array<Handler> = [];
    for (const [filter, handler] of this.funcs) {
      let matched = true;

      const matchConditions = [
        () => {
          if (_.isFunction(this.preCompare)) {
            return this.preCompare(filter, context);
          }
          return true;
        },
        () => placementMatch(filter.first, context.first),
        () => placementMatch(filter.last, context.last),
        () => placementMatch(filter.even, context.even),
        () => placementMatch(filter.odd, context.odd),
        () => placementMatch(filter.index, context.index),
        () => placementMatch(filter.count, context.count),
        () => contextItemMatchFilterItem(filter.parentType, parentType),
        () => contextItemMatchFilterItem(filter.slot, context.slot),
        () => contextItemMatchFilterItem(filter.type, currentType),
      ];

      for (const condition of matchConditions) {
        const r = condition();
        if (!r) {
          matched = false;
          break;
        }
      }

      if (matched) {
        matchedHandlers.push(handler);
      }
    }

    return matchedHandlers;
  }

  public getAll(): Array<[Filter, Handler]> {
    return this.funcs;
  }

}