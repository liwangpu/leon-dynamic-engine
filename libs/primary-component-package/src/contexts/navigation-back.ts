import React from 'react';

export interface INavigationBackContext {
  getGoBackContent(): React.ReactNode;
}

export const NavigationBackContext = React.createContext<INavigationBackContext>(null);