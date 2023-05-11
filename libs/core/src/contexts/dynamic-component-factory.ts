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
  slotIndex?: number;
  slots?: { [slotProperty: string]: Array<string> };
}

export interface IComponentHierarchyManager {
  getParent(id: string): IComponentConfiguration;
  getComponentPath(id: string): Array<IComponentConfiguration>;
  getTreeInfo(id: string): { parent?: IComponentConfiguration, slot?: string, index?: number };
}

export interface IDynamicComponentFactory {
  hierarchyManager: IComponentHierarchyManager;
  getDynamicComponentFactory(): ComponentType<IDynamicComponentProps>;
  getDynamicComponentContainerFactory(): React.ForwardRefExoticComponent<IDynamicComponentContainerProps & React.RefAttributes<IDynamicComponentContainerRendererRef>>;
}

export const DynamicComponentFactoryContext = React.createContext<IDynamicComponentFactory>(null);