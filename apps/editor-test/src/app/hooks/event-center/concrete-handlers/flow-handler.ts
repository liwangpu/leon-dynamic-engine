import { IEventAction } from '@lowcode-engine/core';
import { IActionHandler, IActionHandlerContext, IActionHandlerRequest, IActionHandlerResponse } from '../action-handler';

export class FlowActionHandler implements IActionHandler {

  constructor(public context: IActionHandlerContext) {
    //
  }

  // public handle(request: IActionHandlerRequest): IActionHandlerResponse {
  //   const action = request.actionQueue.deQueue();
  //   console.log(`%c - flow action:${JSON.stringify(action)}`,'color:blue;');
  //   return { done: true };
  // }ll

  public handle(request: IActionHandlerRequest, action: IEventAction): IActionHandlerResponse {
    const actions: Array<IEventAction> = [];
    actions.push(action);


    // 如果下一个也是流类型,合并请求
    while (request.actionQueue.peek()?.type === 'flow') {
      action = request.actionQueue.dequeue();
      actions.push(action);
    }

    console.log(`handle flow action:`, actions);

    // 流处理流程xxxxxx
    // .......


    // 假设流在处理完后需要设置变量
    // this.context.setVariable('id', 'a1');


    return { done: true };
  }

}