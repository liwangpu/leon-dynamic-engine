import React from 'react';

export interface ILeftAreaPluginContext {
  close: () => void;
}

export const LeftAreaPluginContext = React.createContext<ILeftAreaPluginContext>(null);