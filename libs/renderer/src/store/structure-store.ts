import type { IComponentConfiguration } from '@lowcode-engine/core';
import type { Instance, SnapshotIn } from 'mobx-state-tree';
import { types, applySnapshot } from 'mobx-state-tree';
import * as _ from 'lodash';
import { values } from 'mobx';

export interface IComponentHierarchy {
  id: string;
  title: string;
  type: string;
}


const Configuration = types.model({
  id: types.string,
  type: types.string,
  title: types.maybeNull(types.string),
  origin: types.frozen(),
})
  .views(self => ({
    toData: (mutable?: boolean) => {
      if (mutable) {
        return _.cloneDeep(self.origin);
      }
      return self.origin;
    },
  }))
  .actions(self => ({
    setConfig: (conf: IComponentConfiguration) => {
      if ('type' in conf) {
        self.type = conf.type;
      }
      if ('title' in conf) {
        self.title = conf.title;
      }
      const originValue = self.origin ? { ...self.origin, ...conf } : { ...conf, id: self.id };
      self.origin = originValue;
    },
    resetConfig: () => {
      self.title = null;
      self.origin = { id: self.id, type: self.type };
    },
  }));

const ComponentTree = types.model({
  id: types.string,
  type: types.string,
  parentId: types.maybeNull(types.string),
  slotProperty: types.maybeNull(types.string),
  slots: types.map(types.array(types.string)),
}).views(self => ({
  selectSlotComponentIds: (slotProperty: string): Array<string> => {
    if (!self.slots.has(slotProperty)) { return []; }
    return self.slots.get(slotProperty);
  },
})).actions(self => ({
  updateSlot: (slotProperty: string, ids: Array<string>) => {
    self.slots.set(slotProperty, ids);
  },
}));

export type ConfigurationModel = Instance<typeof Configuration>;
export type ComponentTreeModel = Instance<typeof ComponentTree>;

export const StructureStore = types.model({
  rootComponentId: types.maybeNull(types.string),
  configurations: types.map(Configuration),
  trees: types.map(ComponentTree),
})
  /** ************************* trees 相关的views ************************** */
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
      const { slots } = com;
      const childrenIds = slots.get(slotProperty);
      if (!childrenIds) { return null; }
      return [...childrenIds];
    },
    selectComponentsByTypes: (typeList: string[]): Array<ComponentTreeModel> => {
      const components = [];
      self.trees.forEach((comp) => {
        if (typeList.includes(comp.type)) {
          components.push(comp);
        }
      });
      return components;
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
    selectComponentTreeInfo: (id: string) => {
      if (!self.trees.has(id)) { return null; }
      const info: { parentId?: string; parentType?: string; slotProperty?: string; index?: number; } = {};

      const current = self.trees.get(id);
      info.slotProperty = current.slotProperty;
      if (current.parentId) {
        const parent = self.trees.get(current.parentId);
        if (parent) {
          info.index = parent.slots.get(current.slotProperty).findIndex(t => t === id);
          info.parentId = parent.id;
          info.parentType = parent.type;
        }

      }
      return info;
    },
    checkIsComponent: (id: string) => {
      return self.trees.has(id);
    },
    selectAllSubComponentIds: (id: string) => {
      const subIds: Array<string> = [];
      const loopSlots = (subId: string) => {
        if (!subId || !self.trees.has(subId)) { return; }
        const tree = self.trees.get(subId);
        subIds.push(subId);
        tree.slots.forEach(slot => {
          slot.forEach(cid => {
            loopSlots(cid);
          });
        });
      };

      loopSlots(id);

      return subIds;
    },
  }))
  .views(self => ({
    selectSlotLastChildrenId: (id: string, slotProperty: string) => {
      const childrenIds = self.selectSlotChildrenIds(id, slotProperty);
      if (!childrenIds) { return null; }
      return childrenIds[childrenIds.length - 1];
    },
    selectSlotFirstChildrenId: (id: string, slotProperty: string) => {
      const childrenIds = self.selectSlotChildrenIds(id, slotProperty);
      if (!childrenIds) { return null; }
      return childrenIds[0];
    },
    selectSlotChildrenCount: (id: string, slotProperty: string) => {
      const childrenIds = self.selectSlotChildrenIds(id, slotProperty);
      return childrenIds ? childrenIds.length : 0;
    },
  }))
  /** ************************* configurations 相关的views ************************** */
  .views(self => ({
    selectComponentConfigurationWithoutChildren: (id: string, mutable?: boolean): IComponentConfiguration => {
      if (!id || !self.configurations.has(id)) { return null; }
      return self.configurations.get(id).toData(mutable);
    },
    selectComponentConfigurationWithChildren: (id: string): IComponentConfiguration => {
      if (!id || !self.configurations.has(id)) { return null; }
      const tree = self.trees.get(id);
      if (!tree) { return null; }
      const conf = self.configurations.get(id).toData(true);
      tree.slots.forEach((ids, property) => {
        const confs: Array<IComponentConfiguration> = [];
        ids.forEach(cid => {
          const c = self.configurations.get(cid)?.toData(true);
          if (c) {
            confs.push(c);
          }
        });
        if (confs.length) {
          conf[property] = confs;
        }
      });
      return conf;
    },
    selectComponentFirstLayerChildren: (id: string, slotProperty: string): Array<IComponentConfiguration> => {
      const tree = self.trees.get(id);
      if (!tree) { return null; }
      const slotComponetIds = tree.selectSlotComponentIds(slotProperty);
      const confs = [];
      slotComponetIds.forEach(bid => {
        if (!self.configurations.has(bid)) { return; }
        confs.push(self.configurations.get(bid).toData());
      });
      return confs;
    },
    selectComponentTitle: (id: string): string => {
      const conf = self.configurations.get(id);
      const title = conf?.title;
      if (title) { return title; }
      const tree = self.trees.get(id);
      if (!tree) { return null; }
      return tree.type;
    },
    selectRootComponent: (id: string): IComponentConfiguration => {
      let current = self.trees.get(id);
      while (current && current.parentId) {
        current = self.trees.get(current.parentId);
      }
      return current && self.configurations.get(current.id).origin;
    },
    selectAllComponentBasicInfo: (ts?: Array<string>) => {
      const componentIds = self.trees.keys();
      const infos: Array<{ id: string, type: string, title: string, parentId: string }> = [];
      for (const id of componentIds) {
        const tree = self.trees.get(id);
        if (_.isArray(ts) && ts.length) {
          // eslint-disable-next-line no-continue
          if (!ts.some(t => t === tree.type)) { continue; }
        }
        const conf = self.configurations.get(id);
        infos.push({
          id,
          type: tree.type,
          title: conf ? conf.title : '组件',
          parentId: tree.parentId,
        });
      }
      return infos;
    },
    selectComponentPartialConfiguration: (id: string, properties: Array<string>) => {
      if (!id || !self.configurations.has(id) || !_.isArray(properties) || !properties.length) { return null; }
      const conf = self.configurations.get(id).toData(true);
      const config: { [key: string]: any } = { id, type: conf.type };
      for (const p of properties) {
        config[p] = conf[p];
      }
      return config;
    },
    selectComponentPartialConfigurationByTypes: (ts: Array<string>, properties: Array<string>) => {
      if (!_.isArray(ts) || !ts.length || !_.isArray(properties) || !properties.length) { return []; }
      const componentIds = self.trees.keys();
      const infos: Array<{ [key: string]: any }> = [];
      for (const id of componentIds) {
        const tree = self.trees.get(id);
        if (_.isArray(ts) && ts.length) {
          // eslint-disable-next-line no-continue
          if (!ts.some(t => t === tree.type)) { continue; }
        }
        const conf = self.configurations.get(id);
        const config = { id, type: conf.type, title: conf.title };
        for (const p of properties) {
          config[p] = conf[p];
        }
        infos.push(config);
      }
      return infos;
    },
  }))
  .views(self => ({
    getParentConfigurationByChildId(id: string) {
      const parentId = self.selectComponentParentId(id);
      return self.selectComponentConfigurationWithoutChildren(parentId);
    },
    getChildrenIdsByParentId(id: string, slotProperty: string) {
      const { slots } = self.trees.get(id);
      const childrenIds = slots.get(slotProperty);
      return childrenIds;
    },
    selectHierarchyList: (id: string, ignoreTypes?: Array<string>): Array<IComponentHierarchy> => {
      const ignoreTypeSet = new Set<string>(ignoreTypes || []);
      const hierarchyList: Array<IComponentHierarchy> = [];
      let currentId = id;
      let currentNode: IComponentHierarchy;
      while (self.trees.has(currentId)) {
        const treeNode = self.trees.get(currentId);
        const title = self.selectComponentTitle(treeNode.id);
        currentNode = { id: treeNode.id, title, type: treeNode.type };
        if (!ignoreTypeSet.has(treeNode.type)) {
          hierarchyList.unshift(currentNode);
        }

        currentId = treeNode.parentId;
      }
      return hierarchyList;
    },
  }))
  /** ************************* trees 相关的actions ************************** */
  .actions(self => ({
    moveComponent: (id: string, parentId: string, index: number, slotProperty: string) => {
      const componentTrees = self.trees;
      const tree = componentTrees.get(id);
      const originParent = componentTrees.get(tree.parentId);
      const parentTree = componentTrees.get(parentId);
      // // 从原插槽移除
      const originSlotComponentIds: Array<string> = originParent.selectSlotComponentIds(tree.slotProperty);
      originSlotComponentIds.splice(originSlotComponentIds.indexOf(tree.id), 1);
      originParent.updateSlot(tree.slotProperty, originSlotComponentIds);
      const newSlotComponentIds: Array<string> = parentTree.selectSlotComponentIds(slotProperty);
      newSlotComponentIds.splice(index, 0, tree.id);
      parentTree.updateSlot(slotProperty, newSlotComponentIds);
      tree.parentId = parentId;
      tree.slotProperty = slotProperty;
    },
    updateSlot: (id: string, slotProperty: string, childrenIds: Array<string>) => {
      if (!id || !slotProperty || !childrenIds) { return; }
      const componentTrees = self.trees;
      const tree = componentTrees.get(id);
      // eslint-disable-next-line no-unused-expressions
      tree && tree.updateSlot(slotProperty, childrenIds);
    },
    addComponentTree: (conf: IComponentConfiguration, parentId: string, slotProperty: string) => {
      // 注意,纯粹的加上tree节点,不会更新父节点的slot
      const tree = ComponentTree.create({
        id: conf.id,
        type: conf.type,
        parentId,
        slotProperty,
        slots: {},
      });
      self.trees.set(conf.id, tree);
    },
    updateComponentType: (id: string, type: string) => {
      // 注意,纯粹的加上tree节点,不会更新父节点的slot
      const config = self.trees.get(id);
      if (!config) return;
      config.type = type;
      self.trees.set(id, config);
    },
    changeComponentType: (id: string, type) => {
      const tree = self.trees.get(id);
      tree.type = type;
    },
  }))
  /** ************************* configurations 相关的actions ************************** */
  .actions(self => ({
    setState: (state: any) => {
      applySnapshot(self, { ...state });
      const components = self.selectTreeComponents();
      const rootTree = components.find(t => !t.parentId);
      if (rootTree) {
        self.rootComponentId = rootTree.id;
      }
    },
    updateComponentConfiguration: (config: Partial<IComponentConfiguration>) => {
      let conf = self.configurations.get(config.id);
      if (!conf) {
        self.configurations.set(config.id, { id: config.id, type: config.type, title: config.title });
        conf = self.configurations.get(config.id);
      }
      conf.setConfig(config as IComponentConfiguration);
    },
    resetConfiguration: (id: string) => {
      const conf = self.configurations.get(id);
      conf.resetConfig();
    },
  }))
  .actions(self => ({
    deleteComponent: (componentId: string) => {
      if (!self.trees.has(componentId)) { return; }
      const _delete = (id: string) => {
        if (!self.trees.has(id)) { return; }
        const tree = self.trees.get(id);

        if (tree.slots) {
          tree.slots.forEach(v => {
            v.forEach(bid => {
              _delete(bid);
            });
          });
        }
        // self.editingComponentIds.remove(id);
        self.trees.delete(id);
        self.configurations.delete(id);
      };

      // 删除组件在父容器所占的位置
      const currentTree = self.trees.get(componentId);
      if (currentTree.parentId) {
        const parentTree = self.trees.get(currentTree.parentId);
        parentTree.slots.get(currentTree.slotProperty).remove(componentId);
        // self.activeComponent(currentTree.parentId);
      }

      _delete(componentId);
    },
    addComponent: (config: IComponentConfiguration, parentId: string, index: number, slotProperty: string): void => {
      const componentTrees = self.trees;
      const tree: SnapshotIn<ComponentTreeModel> = { id: config.id, type: config.type, parentId, slotProperty };
      componentTrees.set(config.id, tree);
      const parentTree = componentTrees.get(parentId);
      const innerIds = parentTree.selectSlotComponentIds(slotProperty);
      if (!innerIds.includes(config.id)) {
        // 如果index没有定义,放置在末尾
        if (_.isNil(index)) {
          innerIds.push(config.id);
        } else {
          innerIds.splice(index, 0, config.id);
        }
      }
      self.updateComponentConfiguration(config);
      parentTree.updateSlot(slotProperty, innerIds);
    },
  }))
  .actions(self => ({
    clearSlotComponents: (componentId: string, slots?: Array<string>) => {
      if (!self.trees.has(componentId)) { return; }
      const currentTree = self.trees.get(componentId);

      // 如果slots没有定义,默认删除所有
      const needDeleteChildComponentIds: Array<string> = [];
      slots = slots || [];
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

export type StructureStoreModel = Instance<typeof StructureStore>;

export const STRUCTURE_INITIAL_STATE = Object.freeze({
  configurations: {},
  trees: {},
});