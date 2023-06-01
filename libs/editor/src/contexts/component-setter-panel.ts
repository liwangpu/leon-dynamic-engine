import React from 'react';

export interface ISetterPanelContext {
  type: string;
  parentType?: string;
  slot?: string;
  rootType?: string;
}

export const ComponentSetterPanelContext = React.createContext<ISetterPanelContext>(null);