import { Instance, types, applySnapshot, SnapshotIn } from "mobx-state-tree";
import { ConfigurationStore } from './configuration-store';
import { ComponentTreeModel, TreeStore } from './tree-store';
import * as _ from 'lodash';
import { InteractionStore } from './interation-store';
import { IComponentConfiguration } from '@lowcode-engine/core';

export interface IComponentHierarchy {
  id: string;
  title: string;
  type: string;
}

export const INITIAL_STATE = Object.freeze({
  configurationStore: { configurations: {} },
  treeStore: { trees: {} },
  interactionStore: {}
});

const EditorStore = types.model({
  interactionStore: InteractionStore,
  configurationStore: ConfigurationStore,
  treeStore: TreeStore,
})
  .views(self => ({
    getChildrenIdsByParentId(id: string, slotProperty: string) {
      const { slots } = self.treeStore.trees.get(id);
      const childrenIds = slots.get(slotProperty);
      return childrenIds;
    },
    selectHierarchyList: (id: string): Array<IComponentHierarchy> => {
      const { treeStore, configurationStore } = self;
      const hierarchyList: Array<IComponentHierarchy> = [];
      let currentId = id;
      let currentNode: IComponentHierarchy;
      while (treeStore.trees.has(currentId)) {
        const treeNode = treeStore.trees.get(currentId);
        const title = configurationStore.selectComponentTitle(treeNode.id);
        currentNode = { id: treeNode.id, title, type: treeNode.type };
        hierarchyList.unshift(currentNode);
        currentId = treeNode.parentId;
      }
      return hierarchyList;
    },
  }))
  .actions(self => ({
    setState: (state: any) => {
      applySnapshot(self, { ...state });
      // 设置一些基础信息
      // 理论上说,state一般是没有interaction数据的,但是不排除一种,如果是快照类型的state,那么包含这部分的信息
      // 如果没有pageComponentId,可以断定就是没有interaction数据的
      if (!self.interactionStore.pageComponentId) {
        const components = self.treeStore.selectTreeComponents();
        const pageTree = components.find(t => !t.parentId);
        if (pageTree) {
          const pageId = pageTree.id;
          self.interactionStore.pageComponentId = pageId;
          self.interactionStore.activeComponentId = pageId;
          self.interactionStore.editingComponentIds.push(pageId);
        }
      }
    },
    deleteComponent: (componentId: string) => {
      if (!self.treeStore.trees.has(componentId)) { return; }
      const _delete = (id: string) => {
        if (!self.treeStore.trees.has(id)) { return; }
        const tree = self.treeStore.trees.get(id);

        if (tree.slots) {
          // const slotProperties = Object.keys();
          // console.log(`slotProperties:`,slotProperties);
          // for (let property of slotProperties) {
          //   const componentIds = tree.slots[property];
          //   // console.log(`title:`, property, componentIds);
          // }
          tree.slots.forEach(v => {
            v.forEach(bid => {
              _delete(bid);
            });
          });
        }
        self.interactionStore.editingComponentIds.remove(id);
        self.treeStore.trees.delete(id);
        self.configurationStore.configurations.delete(id);
      };

      // 删除组件在父容器所占的位置
      const currentTree = self.treeStore.trees.get(componentId);
      if (currentTree.parentId) {
        const parentTree = self.treeStore.trees.get(currentTree.parentId);
        parentTree.slots.get(currentTree.slotProperty).remove(componentId);
        self.interactionStore.activeComponent(currentTree.parentId);
      }

      _delete(componentId);
    },
    addComponent: (config: IComponentConfiguration, parentId: string, index: number, slotProperty: string): void => {
      const componentTrees = self.treeStore.trees;
      const tree: SnapshotIn<ComponentTreeModel> = { id: config.id, type: config.type, parentId, slotProperty };
      componentTrees.set(config.id, tree);
      const parentTree = componentTrees.get(parentId);
      const innerIds = parentTree.selectSlotComponetIds(slotProperty);
      if (!innerIds.includes(config.id)) {
        innerIds.splice(index, 0, config.id);
      }
      self.configurationStore.updateComponentConfiguration(config);
      parentTree.updateSlot(slotProperty, innerIds);
    },
  }));

export const createStore = () => {
  return EditorStore.create(_.cloneDeep(INITIAL_STATE));
}

export type EditorStoreModel = Instance<typeof EditorStore>;