import React from 'react';
import { DataStoreModel } from '../store';

export const DataStoreContext = React.createContext<DataStoreModel>(null);

export interface IDataStoreCollocation {
  hosting(store: DataStoreModel): void;
}

export const DataStoreCollocationContext = React.createContext<IDataStoreCollocation>(null);