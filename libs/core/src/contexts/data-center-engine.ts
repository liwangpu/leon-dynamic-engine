import React, { ComponentType } from 'react';

export interface IDataCenterEngine {
  setData(field: string, val: any): void;
}

export const DataCenterEngineContext = React.createContext<IDataCenterEngine>(null);