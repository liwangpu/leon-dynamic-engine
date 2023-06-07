import { IEventAction } from '@lowcode-engine/core';
import * as _ from 'lodash';

export class ActionQueue {

  private frontIndex: number = 0;
  private backIndex: number = 0;
  private action: { [key: number]: IEventAction } = {};
  public constructor(actions: Array<IEventAction>) {
    this.action = {}
    this.frontIndex = 0;
    this.backIndex = 0;
    if (_.isArray(actions)) {
      actions.forEach(it => this.enqueue(it));
    }
  }

  public get size() {
    return this.backIndex - this.frontIndex;
  }

  public enqueue(item: IEventAction): void {
    this.action[this.backIndex] = item
    this.backIndex++
  }

  public dequeue() {
    const item = this.action[this.frontIndex];
    delete this.action[this.frontIndex];
    this.frontIndex++;
    return item;
  }

  public peek() {
    return this.action[this.frontIndex];
  }



  // get printQueue() {
  //   return this.items;
  // }
}

export interface IActionHandlerRequest {

}

export interface IActionHandler {
  setNext(handler: IActionHandler): IActionHandler;
  handle(request: IActionHandlerRequest): IActionHandlerRequest;
}

export abstract class AbstractActionHandler implements IActionHandler {
  private nextHandler: IActionHandler;

  public setNext(handler: IActionHandler): IActionHandler {
    this.nextHandler = handler;
    return handler;
  }

  public handle(request: IActionHandlerRequest): IActionHandlerRequest {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }

    return null;
  }
}