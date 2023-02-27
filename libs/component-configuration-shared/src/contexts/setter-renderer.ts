import { IComponentPackage } from '@lowcode-engine/core';
import React from 'react';
import { ISetter, ISetterGroup } from '../models';

export interface ISettterRendererContext {
  getFactory(): React.FC<{ config: ISetter | ISetterGroup }>;
}

export const SettterRendererContext = React.createContext<ISettterRendererContext>(null);