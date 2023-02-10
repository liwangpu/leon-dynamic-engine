import React from 'react';

export interface ISettingItemContext {
  type: string;
  parentType?: string;
  slotProperty?: string;
}

export const ComponentSettingItemContext = React.createContext<ISettingItemContext>(null);