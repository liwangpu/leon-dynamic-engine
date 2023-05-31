import { IComponentConfiguration } from '@lowcode-engine/core';
import { IRendererContext } from './renderer-manager';

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

export class ComponentHierarchyManager implements IComponentHierarchyManager {

  public constructor(protected context: IRendererContext) {
    //
  }

  public getParent(id: string): IComponentConfiguration {
    const parentId = this.context.store.structure.selectComponentParentId(id);
    if (!parentId) { return; }
    return this.context.store.structure.selectComponentConfigurationWithoutChildren(parentId);;
  }

  public getComponentPath(id: string): Array<IComponentConfiguration> {
    return [];
  }

  public getTreeInfo(id: string): { parent?: IComponentConfiguration; slot?: string; index?: number; } {
    const store = this.context.store;
    const treeInfo = store.structure.selectComponentTreeInfo(id);
    if (!treeInfo) { return; }
    const parentId = store.structure.selectComponentParentId(id);
    if (!parentId) { return; }
    const parent = store.structure.selectComponentConfigurationWithoutChildren(parentId);
    return { parent, slot: treeInfo.slotProperty, index: treeInfo.index };
  }

}
