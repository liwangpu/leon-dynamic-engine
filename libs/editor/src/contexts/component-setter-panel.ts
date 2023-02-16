import React from 'react';

export interface ISetterPanelContext {
  type: string;
  parentType?: string;
  slot?: string;
}

export const ComponentSetterPanelContext = React.createContext<ISetterPanelContext>(null);