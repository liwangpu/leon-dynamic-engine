// class Stack {

//   constructor() {
//     this.items = [];
//   }

//   push(element) {
//     this.items.push(element);
//   }

//   pop() {
//     return this.items.pop();
//   }

//   peek() {
//     return this.items[this.items.length - 1];
//   }

//   isEmpty() {
//     return this.items.length === 0;
//   }

//   size() {
//     return this.items.length;
//   }

//   clear() {
//     this.items = [];
//   }
// }

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