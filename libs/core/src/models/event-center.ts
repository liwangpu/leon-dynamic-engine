import { EventActionType } from '../enums';

export interface IEvent {
  before?: {
    enablePrompt?: boolean;
    prompt?: string;
  };
  execute?: {
    actions: Array<IEventAction>
  };
  after?: {
    enablePrompt?: boolean;
    prompt?: string;
  };
}

interface IEventActionBase {
  id: string;
  title: string;
}

export interface IOpenUrlEventAction extends IEventActionBase {
  type: EventActionType.openUrl;
  params: { url: string; target?: '_blank' | '_self' | '_parent' | '_top' };
}

export interface IExecuteComponentEventAction extends IEventActionBase {
  type: EventActionType.executeComponentAction;
}

export type IEventAction = IOpenUrlEventAction | IExecuteComponentEventAction;