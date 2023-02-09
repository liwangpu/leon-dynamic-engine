import { getParent, Instance, SnapshotIn, types } from "mobx-state-tree";
import * as _ from 'lodash';
import { values } from 'mobx';
import { IComponentConfiguration } from '@lowcode-engine/core';
import { EditorStoreModel } from './editor-store';

const ComponentTree = types.model({
  id: types.string,
  type: types.string,
  parentId: types.maybeNull(types.string),
  slotProperty: types.maybeNull(types.string),
  slots: types.map(types.array(types.string))
}).views(self => ({
  selectSlotComponetIds: (slotProperty: string): Array<string> => {
    if (!self.slots.has(slotProperty)) { return []; }
    return self.slots.get(slotProperty);
  },
})).actions(self => ({
  updateSlot: (slotProperty: string, ids: Array<string>) => {
    self.slots.set(slotProperty, ids);
  }
}));

export const TreeStore = types.model({
  trees: types.map(ComponentTree)
})
  .views(self => ({
    selectTreeComponents: (): Array<ComponentTreeModel> => {
      return values(self.trees) as any;
    },
    selectComponentType: (id: string): string => {
      if (!self.trees.has(id)) { return null; }
      return self.trees.get(id).type;
    },
    selectParentComponentType: (id: string): string => {
      if (!self.trees.has(id)) { return null; }
      const com = self.trees.get(id);
      if (!com.parentId) { return null; }
      return self.trees.get(com.parentId).type;
    }
  }))
  .actions(self => ({
    addComponent: (config: IComponentConfiguration, parentId: string, index: number, slotProperty: string): void => {
      const parent: EditorStoreModel = getParent(self);
      const componentTrees = self.trees;
      const tree: SnapshotIn<ComponentTreeModel> = { id: config.id, type: config.type, parentId, slotProperty };
      componentTrees.set(config.id, tree);
      const parentTree = componentTrees.get(parentId);
      const innerIds = parentTree.selectSlotComponetIds(slotProperty);
      innerIds.splice(index, 0, config.id);
      parent.configurationStore.updateComponentConfiguration(config);
      parentTree.updateSlot(slotProperty, innerIds);
    },
    moveComponent: (id: string, parentId: string, index: number, slotProperty: string) => {
      const componentTrees = self.trees;
      const tree = componentTrees.get(id);
      const originParent = componentTrees.get(tree.parentId);
      const parentTree = componentTrees.get(parentId);
      // // 从原插槽移除
      const originSlotComponentIds: Array<string> = originParent.selectSlotComponetIds(tree.slotProperty);
      originSlotComponentIds.splice(originSlotComponentIds.indexOf(tree.id), 1);
      originParent.updateSlot(tree.slotProperty, originSlotComponentIds);
      const newSlotComponentIds: Array<string> = parentTree.selectSlotComponetIds(slotProperty);
      newSlotComponentIds.splice(index, 0, tree.id)
      parentTree.updateSlot(slotProperty, newSlotComponentIds);
      tree.parentId = parentId;
      tree.slotProperty = slotProperty;
      // componentTrees.set(tree.id, tree);
      // componentTrees.set(originParent.id, originParent);
      // componentTrees.set(parentTree.id, parentTree);
    }
  }));

export type ComponentTreeModel = Instance<typeof ComponentTree>;
export type TreeStoreModel = Instance<typeof TreeStore>;