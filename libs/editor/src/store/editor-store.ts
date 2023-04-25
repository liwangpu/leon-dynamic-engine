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
    selectHierarchyList: (id: string, ignoreTypes?: Array<string>): Array<IComponentHierarchy> => {
      const ignoreTypeSet = new Set<string>(ignoreTypes || []);
      const { treeStore, configurationStore } = self;
      const hierarchyList: Array<IComponentHierarchy> = [];
      let currentId = id;
      let currentNode: IComponentHierarchy;
      while (treeStore.trees.has(currentId)) {
        const treeNode = treeStore.trees.get(currentId);
        const title = configurationStore.selectComponentTitle(treeNode.id);
        currentNode = { id: treeNode.id, title, type: treeNode.type };
        if (!ignoreTypeSet.has(treeNode.type)) {
          hierarchyList.unshift(currentNode);
        }

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
      if (!self.interactionStore.rootId) {
        const components = self.treeStore.selectTreeComponents();
        const rootTree = components.find(t => !t.parentId);
        if (rootTree) {
          const rootId = rootTree.id;
          self.interactionStore.rootId = rootId;
          self.interactionStore.activeComponentId = rootId;
          self.interactionStore.editingComponentIds.push(rootId);
        }
      }
    },
    deleteComponent: (componentId: string, insistActive?: boolean) => {
      if (!self.treeStore.trees.has(componentId)) { return; }
      const _delete = (id: string) => {
        if (!self.treeStore.trees.has(id)) { return; }
        const tree = self.treeStore.trees.get(id);

        if (tree.slots) {
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
        if (self.interactionStore.activeComponentId === componentId) {
          if (!insistActive) {
            // 如果当前组件是激活组件,那么设置父组件为激活组件
            self.interactionStore.activeComponent(currentTree.parentId);
          }
        }
      }

      _delete(componentId);
    },
    addComponent: (config: IComponentConfiguration, parentId: string, index: number, slotProperty: string): void => {
      const componentTrees = self.treeStore.trees;
      const parentTree = componentTrees.get(parentId);
      if (!parentId || !parentTree) {
        console.error(`父组件已经被删除,添加将不生效`);
        return;
      }
      const tree: SnapshotIn<ComponentTreeModel> = { id: config.id, type: config.type, parentId, slotProperty };
      componentTrees.set(config.id, tree);
      const innerIds = parentTree.selectSlotComponetIds(slotProperty);
      if (!innerIds.includes(config.id)) {
        innerIds.splice(index, 0, config.id);
      }
      self.configurationStore.updateComponentConfiguration(config);
      parentTree.updateSlot(slotProperty, innerIds);
    },
  })).actions(self => ({
    clearSlotComponents: (componentId: string, slots?: Array<string>) => {
      if (!self.treeStore.trees.has(componentId)) { return; }
      const currentTree = self.treeStore.trees.get(componentId);

      // 如果slots没有定义,默认删除所有
      const needDeleteChildComponentIds: Array<string> = [];
      slots = slots ? slots : [];
      currentTree.slots.forEach((ids, slotProperty) => {
        if (slots && slots.length) {
          if (!slots.some(s => s === slotProperty)) {
            return;
          }
        }
        ids.forEach(id => needDeleteChildComponentIds.push(id));
        slots.push(slotProperty);
      });

      needDeleteChildComponentIds.forEach(id => {
        self.deleteComponent(id);
      });

      slots.forEach(sp => {
        currentTree.slots.delete(sp);
      });
    },
  }));

export const createStore = () => {
  return EditorStore.create(_.cloneDeep(INITIAL_STATE));
}

export type EditorStoreModel = Instance<typeof EditorStore>;