import React, { ComponentType } from 'react';
import { IEvent } from '../models';

export interface IEventCenterEngineContext {
  dispatch(event: IEvent, data?: any): Promise<any>;
}

export const EventCenterEngineContext = React.createContext<IEventCenterEngineContext>(null);