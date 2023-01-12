import { Observable, Subject } from 'rxjs';
import { EventTopicEnum } from '../enums';
import { IEditorContext } from './i-editor-context';
import { IEventManager } from './i-event-manager';

export interface IEventMessage {
  topic: string | EventTopicEnum;
  data?: any;
}

export class EventManager implements IEventManager{

  private readonly _message = new Subject<IEventMessage>();
  public constructor(private context: IEditorContext) { }

  public get message(): Observable<IEventMessage> {
    return this._message.asObservable();
  }

  public emit(topic: string | EventTopicEnum, data?: any): void {
    this._message.next({ topic, data });
  }

}