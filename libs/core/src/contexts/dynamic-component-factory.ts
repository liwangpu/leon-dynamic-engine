import React, { ComponentType } from 'react';
import { IComponentConfiguration, IDynamicComponentProps } from '../models';

export interface IDynamicComponentFactory {
  getDynamicComponentRenderFactory(): ComponentType<IDynamicComponentProps>;
  getDynamicComponentCustomRenderFactory?(): React.FC<{ configuration: IComponentConfiguration, children: React.ReactNode }>;
}

export const DynamicComponentFactoryContext = React.createContext<IDynamicComponentFactory>(null);