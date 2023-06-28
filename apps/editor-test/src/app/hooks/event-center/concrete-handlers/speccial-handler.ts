import { EventActionType, IEventAction } from '@lowcode-engine/core';
import { IActionHandler, IActionHandlerRequest, IActionHandlerResponse } from '../action-handler';

export class SpecialActionHandler implements IActionHandler {

  public handle(request: IActionHandlerRequest, action: IEventAction): IActionHandlerResponse {
    console.log(`%c - special action:${JSON.stringify(action)}`, 'color:red;');

    request.actionQueue.jumpQueue({
      id: 'xxxx',
      title: '打开本地一个页面',
      type: EventActionType.openUrl,
      params: {
        url: 'http://localhost:9876',
        target: '_blank'
      }
    });

    return { done: true };
  }

}