import { IComponentConfiguration, IEventAction } from '@lowcode-engine/core';
import * as _ from 'lodash';

/**
 * 动作执行队列
 */
export class ActionQueue {

  /**
   * 队列执行下标
   */
  private frontIndex: number;
  /**
   * 队列长度下标
   */
  private backIndex: number;
  /**
   * 队列
   */
  private action: { [key: number]: IEventAction };
  public constructor(actions: Array<IEventAction>) {
    this.initialize();
    if (_.isArray(actions)) {
      actions.forEach(it => this.enqueue(it));
    }
  }

  /**
   * 队列长度
   */
  public get size() {
    return this.backIndex - this.frontIndex;
  }

  /**
   * 入队
   * @param item 
   */
  public enqueue(item: IEventAction): void {
    this.action[this.backIndex] = Object.freeze(item);
    this.backIndex++;
  }

  /**
   * 插入到队列最前位置
   * @param item 
   */
  public jumpQueue(item: IEventAction): void {
    this.backIndex++;
    for (let i = this.backIndex; i > this.frontIndex; i--) {
      this.action[i] = this.action[i - 1];
    }
    this.action[this.frontIndex] = item;
  }

  /**
   * 出队
   * @returns 
   */
  public dequeue(): IEventAction {
    const item = this.action[this.frontIndex];
    delete this.action[this.frontIndex];
    this.frontIndex++;
    return item;
  }

  /**
   * 查看最新一个动作
   * @returns 
   */
  public peek(): IEventAction {
    return this.action[this.frontIndex];
  }

  /**
   * 清空队列
   */
  public clear(): void {
    this.initialize();
  }

  /**
   * 初始化队列
   */
  private initialize(): void {
    this.action = {}
    this.frontIndex = 0;
    this.backIndex = 0;
  }

}

/**
 * 动作执行请求
 */
export interface IActionHandlerRequest {
  actionQueue: ActionQueue;
}

export interface IActionHandlerResponse {
  /**
   * handler是否成功处理动作
   * 注意:如果动作队列有一步没有成功处理,那么动作队列链往下动作会被取消执行,
   *      所以每一步处理成功的handler都要自己返回done=true,否则都将视为处理失败,包括response=null/undefined
   */
  done: boolean;
  /**
   * 该handler里面有没有返回的变量
   */
  variable?: Array<{ [key: string]: any }>;
  /**
   * 其他返回信息
   */
  params?: {
    /**
     * 是否要更新数据
     * 一般指对话框调用端是列表,而对话框中有数据新增/更新操作
     */
    dataFefresh?: boolean;
  };
}

/**
 * 动作执行处理者
 */
export interface IActionHandler {
  handle(request: IActionHandlerRequest, action: IEventAction, data?: any): IActionHandlerResponse | Promise<IActionHandlerResponse>;
}

/**
 * 动作执行处理者类型
 */
export interface ActionHandlerConstructor {
  new(context: IActionHandlerContext): IActionHandler;
}

/**
 * 动作执行处理者上下文
 */
export interface IActionHandlerContext {
  /**
   * 触发动作的组件
   */
  component: IComponentConfiguration;


}