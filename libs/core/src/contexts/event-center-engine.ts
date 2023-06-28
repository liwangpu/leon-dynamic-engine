import React, { ComponentType } from 'react';
import { IComponentConfiguration, IEvent } from '../models';

export interface IEventCenterEngineContext {
  dispatch(component: IComponentConfiguration, event: IEvent, data?: any): Promise<any>;
  registerAction(component: IComponentConfiguration, action: string, executor: (data?: any) => Promise<any>): void;
  deRegisterAction(component: IComponentConfiguration): void;
}

export const EventCenterEngineContext = React.createContext<IEventCenterEngineContext>(null); 