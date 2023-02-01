import React from 'react';
import { EditorStoreModel } from '../store';

export interface IDataStoreCollocation {
  hosting(store: EditorStoreModel): void;
}

export const DataStoreCollocationContext = React.createContext<IDataStoreCollocation>(null);