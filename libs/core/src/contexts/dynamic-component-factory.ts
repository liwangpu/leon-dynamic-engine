import React, { ComponentType } from 'react';
import { IDynamicComponentContainerProps, IDynamicComponentProps } from '../models';

export interface IDynamicComponentContainerRendererRef {
  scrollToEnd(): void;
  getContainerRef(): HTMLDivElement;
}

export interface IDynamicComponentFactory {
  getDynamicComponentFactory(): ComponentType<IDynamicComponentProps>;
  getDynamicComponentContainerFactory(): React.ForwardRefExoticComponent<IDynamicComponentContainerProps & React.RefAttributes<IDynamicComponentContainerRendererRef>>;
}

export const DynamicComponentFactoryContext = React.createContext<IDynamicComponentFactory>(null);