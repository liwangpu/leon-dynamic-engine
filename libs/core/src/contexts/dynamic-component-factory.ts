import React, { ComponentType } from 'react';
import { IComponentConfiguration, IDynamicComponentContainerProps, IDynamicComponentProps } from '../models';

export interface IDynamicComponentContainerRendererRef {
  scrollToEnd(): void;
  getContainerRef(): HTMLDivElement;
}

export interface IComponentHierarchyNode {
  id: string;
  type: string;
  parentId?: string;
  slotProperty?: string;
  slots?: { [slotProperty: string]: Array<string> };
}

export interface IComponentHierarchyManager {
  getParent(id: string): IComponentConfiguration;
}

export interface IDynamicComponentFactory {
  hierarchyManager: IComponentHierarchyManager;
  getDynamicComponentFactory(): ComponentType<IDynamicComponentProps>;
  getDynamicComponentContainerFactory(): React.ForwardRefExoticComponent<IDynamicComponentContainerProps & React.RefAttributes<IDynamicComponentContainerRendererRef>>;
}

export const DynamicComponentFactoryContext = React.createContext<IDynamicComponentFactory>(null);