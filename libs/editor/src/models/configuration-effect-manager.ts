import { EffectHandlerStorage, IBaseEffectContext, IBaseEffectFilter, IBaseEffectParam, IComponentConfiguration } from '@lowcode-engine/core';
import { IEditorContext } from './editor-manager';
import * as _ from 'lodash';

// ------------------------------添加组件副作用------------------------------ //

/**
 * 添加组件过滤条件
 */
export type IConfigurationAddingFilter = IBaseEffectFilter;

/**
 * 添加组件处理器参数
 */
export interface IConfigurationAddingParam extends IBaseEffectParam {
  path: Array<IComponentConfiguration>;
  index?: number;
};

/**
 * 添加组件处理器
 */
export interface IConfigurationAddingHandler {
  (param: IConfigurationAddingParam): IComponentConfiguration | Promise<IComponentConfiguration>;
}

/**
 * 添加组件后的处理器
 */
export interface IConfigurationAfterAddingHandler {
  (param: IConfigurationAddingParam): void | Promise<void>;
}

/**
 * 添加组件副作用处理中心
 */
export interface IConfigurationAddingEffectManager {
  /**
   * 注册添加组件处理器
   * @param filter 过滤条件
   * @param handler 处理器
   */
  registerHandler(filter: IConfigurationAddingFilter, handler: IConfigurationAddingHandler, afterAddingHandler?: IConfigurationAfterAddingHandler): void;
  /**
   * 使用添加组件处理器
   * @param param 处理器参数
   */
  handleAdd(param: IConfigurationAddingParam): Promise<IComponentConfiguration>;
  /**
   * 使用添加组件后的处理器
   * @param param 
   */
  handleAfterAdd(param: IConfigurationAddingParam): Promise<void>;
}

/**
 * 添加组件副作用处理中心实现
 */
export class ConfigurationAddingEffectManager implements IConfigurationAddingEffectManager {

  private readonly addHandlers = new EffectHandlerStorage<IConfigurationAddingHandler, IConfigurationAddingFilter>();
  private readonly addAfterHandlers = new EffectHandlerStorage<IConfigurationAfterAddingHandler, IConfigurationAddingFilter>();
  public constructor(protected context: IEditorContext) { }

  public registerHandler(filter: IBaseEffectFilter, handler: IConfigurationAddingHandler, afterAddingHandler?: IConfigurationAfterAddingHandler): void {
    this.addHandlers.add(filter, handler);
    this.addAfterHandlers.add(filter, afterAddingHandler);
  }

  public async handleAdd(param: IConfigurationAddingParam): Promise<IComponentConfiguration> {
    const handlers = this.addHandlers.get({
      type: param.current.type,
      parentType: param.parent?.type,
      slot: param.slot,
    });

    if (handlers && handlers.length) {
      for (const handler of handlers) {
        param.current = await handler(param);
        // 如果current为null/undefined那么认为取消此次添加
        if (!param.current) {
          return null;
        }
      }
    }
    return param.current;
  }

  public async handleAfterAdd(param: IConfigurationAddingParam): Promise<void> {
    const handlers = this.addAfterHandlers.get({
      type: param.current.type,
      parentType: param.parent?.type,
      slot: param.slot,
    });

    if (handlers && handlers.length) {
      for (const handler of handlers) {
        await handler(param);
      }
    }
  }

}

// ------------------------------删除组件副作用------------------------------ //

/**
 * 删除组件过滤条件
 */
export type IConfigurationDeleteFilter = IBaseEffectFilter;

/**
 * 删除组件参数
 */
export type IConfigurationDeleteParam = IBaseEffectParam;

/**
 * 删除组件处理器
 */
export interface IConfigurationDeleteHandler {
  (param: IConfigurationDeleteParam): boolean | Promise<boolean>
}

/**
 * 删除组件后处理器
 */
export interface IConfigurationAfterDeleteHandler {
  (param: IConfigurationDeleteParam): void | Promise<void>;
}

/**
 * 删除组件副作用处理中心
 */
export interface IConfigurationDeleteEffectManager {
  /**
   * 注册删除组件处理器
   * @param filter 过滤条件
   * @param handler 删除处理器
   * @param afterDeleteHandler 删除后处理器
   */
  registerHandler(filter: IConfigurationDeleteFilter, handler?: IConfigurationDeleteHandler, afterDeleteHandler?: IConfigurationAfterDeleteHandler): void;
  /**
   * 使用删除组件处理器
   * @param param 处理器参数
   */
  handleDelete(param: IConfigurationDeleteParam): Promise<boolean>;
  /**
   * 使用删除组件后处理器
   * @param param 处理器参数
   */
  handleAfterDelete(param: IConfigurationDeleteParam): Promise<void>;
}

/**
 * 删除组件副作用处理中心实现
 */
export class ConfigurationDeleteEffectManager implements IConfigurationDeleteEffectManager {

  private readonly deleteHandlers = new EffectHandlerStorage<IConfigurationDeleteHandler, IConfigurationDeleteFilter>();
  private readonly deleteAfterHandlers = new EffectHandlerStorage<IConfigurationAfterDeleteHandler, IConfigurationDeleteFilter>();
  public constructor(protected context: IEditorContext) { }


  public registerHandler(filter: IConfigurationDeleteFilter, handler?: IConfigurationDeleteHandler, afterDeleteHandler?: IConfigurationAfterDeleteHandler): void {
    this.deleteHandlers.add(filter, handler);
    this.deleteAfterHandlers.add(filter, afterDeleteHandler);
  }

  public async handleDelete(param: IConfigurationDeleteParam): Promise<boolean> {
    const handlers = this.deleteHandlers.get({
      type: param.current.type,
      parentType: param.parent?.type,
      slot: param.slot,
    });

    if (handlers && handlers.length) {
      for (const handler of handlers) {
        return await handler(param);
      }
    }
    return true;
  }

  public async handleAfterDelete(param: IConfigurationDeleteParam): Promise<void> {
    const handlers = this.deleteAfterHandlers.get({
      type: param.current.type,
      parentType: param.parent?.type,
      slot: param.slot,
    });

    if (handlers && handlers.length) {
      for (const handler of handlers) {
        await handler(param);
      }
    }
  }

}

// ------------------------------转换组件类型副作用------------------------------ //

/**
 * 类型转换过滤条件
 */
export interface ITypeTransferFilter extends IBaseEffectFilter {
  /**
   * 目标组件类型
   */
  destType: string;
}

/**
 * 类型转化处理器参数
 */
export interface ITypeTransferParam extends IBaseEffectParam {
  /**
   * 转换前的组件配置
   */
  previous: IComponentConfiguration;
  /**
   * 转化后的组件配置(不是最终的,只是相对之前的)
   */
  current: IComponentConfiguration;
}

/**
 * 
 */
export interface ITypeTransferContext extends IBaseEffectContext {
  /**
   * 目标组件类型
   */
  destType: string;
}

/**
 * 类型转化处理器
 */
export interface ITypeTransferHandler {
  (param: ITypeTransferParam): Partial<IComponentConfiguration> | Promise<Partial<IComponentConfiguration>>;
}

/**
 * 组件类型转换副作用管理器
 * 组件转换类型会进行以下操作
 *    > 原组件以及子组件会被删除(但是原组件的id保留)
 *    > (新组件以及新组件配置会被添加,原组件下标位置会被新组件替代,如果原组件id保留,这一步可以省略)
 *    > 如果原组件是出于激活状态,那么切换新组件为激活状态
 */
export interface IConfigurationTypeTransferEffectManager {
  /**
   * 
   * @param filter 类型转换过滤条件
   * @param handler 副作用数据处理函数
   */
  registerHandler(filter: ITypeTransferFilter, handler: ITypeTransferHandler): void;
  /**
   * 处理类型转换
   * @param param 组件类型转换参数
   */
  handle(param: ITypeTransferParam): Promise<IComponentConfiguration>;
}

export class ConfigurationTypeTransferEffectManager implements IConfigurationTypeTransferEffectManager {

  private readonly handlers = new EffectHandlerStorage<ITypeTransferHandler, ITypeTransferFilter, ITypeTransferContext>((filter, context) => {
    return filter.destType === context.destType;
  });

  public constructor(protected context: IEditorContext) {

  }

  public registerHandler(filter: ITypeTransferFilter, handler: ITypeTransferHandler): void {
    this.handlers.add(filter, handler);
  }

  public async handle(param: ITypeTransferParam): Promise<IComponentConfiguration> {
    const current: IComponentConfiguration = { ...param.current };
    const handlers = this.handlers.get({
      type: param.previous.type,
      parentType: param.parent?.type,
      slot: param.slot,
      destType: param.current.type,
    });

    if (handlers && handlers.length) {
      for (const handler of handlers) {
        const conf = await handler(param) as any;
        // 维持id,type怕万一handler里面忘记转过来
        conf.id = current.id;
        conf.type = current.type;
        return conf;
      }
    }

    return param.current;
  }

}
