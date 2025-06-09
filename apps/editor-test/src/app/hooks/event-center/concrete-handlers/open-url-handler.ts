import { IEventAction } from '@lowcode-engine/core';
import {
  IActionHandler,
  IActionHandlerRequest,
  IActionHandlerResponse,
} from '../action-handler';

export class OpenUrlActionHandler implements IActionHandler {
  public handle(
    request: IActionHandlerRequest,
    action: IEventAction
  ): IActionHandlerResponse {
    const { params } = action as any;
    if (!params || !params.target || !params.url) {
      console.error(
        `执行动作参数没有定义完整,故操将不会执行,具体定义为:`,
        action
      );
      return { done: false };
    }
    window.open(params.url, params.target);
    return { done: true };
  }
}
