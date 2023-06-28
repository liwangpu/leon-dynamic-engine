import { IEventAction } from '@lowcode-engine/core';
import { IActionHandler, IActionHandlerRequest, IActionHandlerResponse } from '../action-handler';

export class OpenUrlActionHandler implements IActionHandler {

  public handle(request: IActionHandlerRequest, action: IEventAction): IActionHandlerResponse {

    // console.log(`%c - open url action:${JSON.stringify(action)}`,'color:green;');

    return { done: true }
  }

}