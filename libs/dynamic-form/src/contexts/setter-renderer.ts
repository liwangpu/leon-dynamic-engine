import React from 'react';
import { ISetter } from '../models';

export interface ISettterRendererContext {
  getFactory(): React.FC<{ config: ISetter  }>;
}

export const SettterRendererContext = React.createContext<ISettterRendererContext>(null);

export interface ISettterContext {
  config: ISetter ;
}

export const SettterContext = React.createContext<ISettterContext>(null);