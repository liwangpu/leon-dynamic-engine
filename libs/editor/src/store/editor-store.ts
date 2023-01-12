import { Instance, types, applySnapshot } from "mobx-state-tree";
import { ConfigurationStore } from './configuration-store';
import { TreeStore } from './tree-store';
import * as _ from 'lodash';
import { InteractionStore } from './interation-store';

export const INITIAL_STATE = Object.freeze({
  configurationStore: { configurations: {} },
  treeStore: { trees: {} },
  interactionStore: {}
});

const EditorStore = types.model({
  interactionStore: InteractionStore,
  configurationStore: ConfigurationStore,
  treeStore: TreeStore,
}).actions(self => ({
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
  }
}));

export const createStore = () => {
  return EditorStore.create(_.cloneDeep(INITIAL_STATE));
}

export type EditorStoreModel = Instance<typeof EditorStore>;