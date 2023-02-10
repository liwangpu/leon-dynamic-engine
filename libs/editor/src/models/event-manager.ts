import { Observable, Subject } from 'rxjs';
import { EventTopicEnum } from '../enums';
import { IEditorContext } from './editor-manager';

export interface IEventMessage {
  topic: string | EventTopicEnum;
  data?: any;
}

export interface IEventManager {

  get message(): Observable<IEventMessage>;

  emit(topic: string | EventTopicEnum, data?: any): void;

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