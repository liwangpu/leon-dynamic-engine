import React, { ComponentType } from 'react';
import { IComponentConfiguration, IDynamicComponentProps } from '../models';

export interface ICustomRenderOptions {
  disableUIInteraction?: boolean;
}

export interface IDynamicComponentCustomRenderProps {
  configuration: IComponentConfiguration;
  children: React.ReactNode | ((c: IComponentConfiguration) => React.ReactNode), options?: ICustomRenderOptions;
}

export interface IDynamicComponentContainerProps {
  configuration: Partial<IComponentConfiguration> & { id: string };
  slot: string;
  direction?: 'horizontal' | 'vertical';
  dropOnly?: boolean;
  className?: string | Array<string> | { [name: string]: boolean };
  style?: { [property: string]: any };
  children?: (cs: Array<IComponentConfiguration>) => React.ReactNode;
}

export interface IDynamicComponentContainerRef {
  scrollToEnd(): void;
  getContainerRef(): HTMLDivElement;
}

export interface IDynamicComponentFactory {
  getDynamicComponentRenderFactory(): ComponentType<IDynamicComponentProps>;
  getDynamicComponentContainerRenderFactory?(): React.ForwardRefExoticComponent<IDynamicComponentContainerProps & React.RefAttributes<IDynamicComponentContainerRef>>;
}

export const DynamicComponentFactoryContext = React.createContext<IDynamicComponentFactory>(null);