import React, { useContext, useEffect } from 'react';

export interface IStoreMonitor {
  hosting(name: string, store: any): void;
}

export const StoreMonitorContext = React.createContext<IStoreMonitor>(null);