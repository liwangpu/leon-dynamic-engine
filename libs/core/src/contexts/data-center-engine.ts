import React, { ComponentType } from 'react';

export interface IDataCenterEngine {
  setData(field: string, val: any): void;
  setState(componentId: string, property: string, data?: any): void;
}

export const DataCenterEngineContext = React.createContext<IDataCenterEngine>(null);