import React from 'react';
import { RootStoreModel } from '../stores';

export const StoreContext = React.createContext<RootStoreModel>({} as RootStoreModel);