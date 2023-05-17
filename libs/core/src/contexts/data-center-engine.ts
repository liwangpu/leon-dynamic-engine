import React, { ComponentType } from 'react';

export interface IDataCenterEngine {
  setData(field: string, val: any): void;
  setState(componentId: string, property: string, data?: any): void;
  getState(componentId: string, property: string): any;
  getVisible(componentId: string): boolean;
}

export const DataCenterEngineContext = React.createContext<IDataCenterEngine>(null);