import React, { ComponentType } from 'react';
import { IComponentConfiguration, IDynamicComponentProps } from '../models';

export interface IDynamicComponentRendererProps extends IDynamicComponentProps {
  className?: string | Array<string> | { [name: string]: boolean };
  children?: React.ReactNode | ((conf: IComponentConfiguration) => React.ReactNode);
  options?: { [key: string]: any };
}

export interface IDynamicComponentContainerRendererProps {
  configuration: Partial<IComponentConfiguration> & { id: string };
  slot: string;
  direction?: 'horizontal' | 'vertical';
  dropOnly?: boolean;
  className?: string | Array<string> | { [name: string]: boolean };
  style?: { [property: string]: any };
  children?: (cs: Array<IComponentConfiguration>) => React.ReactNode;
}

export interface IDynamicComponentContainerRendererRef {
  scrollToEnd(): void;
  getContainerRef(): HTMLDivElement;
}

export interface IDynamicComponentFactory {
  getDynamicComponentRenderFactory(): ComponentType<IDynamicComponentRendererProps>;
  getDynamicComponentContainerRenderFactory?(): React.ForwardRefExoticComponent<IDynamicComponentContainerRendererProps & React.RefAttributes<IDynamicComponentContainerRendererRef>>;
}

export const DynamicComponentFactoryContext = React.createContext<IDynamicComponentFactory>(null);