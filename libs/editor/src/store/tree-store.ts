import { Instance, types } from "mobx-state-tree";
import * as _ from 'lodash';
import { values } from 'mobx';
import { IComponentConfiguration } from '@lowcode-engine/core';

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
    selectComponentParentId: (id: string): string => {
      if (!self.trees.has(id)) { return null; }
      return self.trees.get(id).parentId;
    },
    selectParentComponentType: (id: string): string => {
      if (!self.trees.has(id)) { return null; }
      const com = self.trees.get(id);
      if (!com.parentId) { return null; }
      return self.trees.get(com.parentId).type;
    },
    selectParentSlotProperty: (id: string): string => {
      if (!self.trees.has(id)) { return null; }
      const com = self.trees.get(id);
      return com.slotProperty;
    },
    selectSlotChildrenIds: (id: string, slotProperty: string) => {
      if (!self.trees.has(id)) { return null; }
      const com = self.trees.get(id);
      const slots = com.slots;
      const childrenIds = slots.get(slotProperty);
      if (!childrenIds) { return null; }
      return [...childrenIds];
    },
    checkIsDescendantComponent: (ancestorId: string, descendantId: string) => {
      let isDescendant = false;
      const check = (comId: string) => {
        if (comId === ancestorId) {
          isDescendant = true;
          return;
        }
        const com = self.trees.get(comId);

        if (com.parentId) {
          if (com.parentId === ancestorId) {
            isDescendant = true;
            return;
          } else {
            check(com.parentId);
          }
        }
      };

      check(descendantId);

      return isDescendant;
    },
    selectComponentTypeCount: (type: string): number => {
      let count = 0;
      self.trees.forEach(v => {
        if (v.type === type) {
          count++;
        }
      });
      return count;
    },
  }))
  .actions(self => ({
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
    },
    updateSlot: (id: string, slotProperty: string, childrenIds: Array<string>) => {
      if (!id || !slotProperty || !childrenIds) { return; }
      const componentTrees = self.trees;
      const tree = componentTrees.get(id);
      tree.updateSlot(slotProperty, childrenIds);
    },
    addComponentTree: (conf: IComponentConfiguration, parentId: string, slotProperty: string) => {
      // 注意,纯粹的加上tree节点,不会更新父节点的slot
      const tree = ComponentTree.create({
        id: conf.id,
        type: conf.type,
        parentId,
        slotProperty,
        slots: {}
      });
      self.trees.set(conf.id, tree);
    },
  }));

export type ComponentTreeModel = Instance<typeof ComponentTree>;
export type TreeStoreModel = Instance<typeof TreeStore>;