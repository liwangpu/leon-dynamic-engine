import { Observable } from 'rxjs';
import { EventTopicEnum } from '../enums';
import { IEventMessage } from './event-manager';

export interface IEventManager {

  get message(): Observable<IEventMessage>;

  emit(topic: string | EventTopicEnum, data?: any): void;

}