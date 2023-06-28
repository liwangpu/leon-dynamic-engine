import { IEventAction } from '@lowcode-engine/core';
import { IActionHandler, IActionHandlerRequest, IActionHandlerResponse } from '../action-handler';

export class DefaultActionHandler implements IActionHandler {

  public handle(): IActionHandlerResponse {
    // 返回done为false,那么actionQueue会把队列清空
    console.warn(`匹配到未开发的动作类型,取消执行下游所有动作!`);
    return { done: false };
  }

}