import { IComponentConfiguration } from '@lowcode-engine/core';
import { getParent, Instance, types } from "mobx-state-tree";
import { EditorStoreModel } from './editor-store';
import * as _ from 'lodash';

const Configuration = types.model({
  id: types.string,
  type: types.string,
  title: types.maybeNull(types.string),
  origin: types.frozen()
})
  .views(self => ({
    toData: (mutable?: boolean) => {
      if (mutable) {
        return _.cloneDeep(self.origin);
      }
      return self.origin;
    }
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
    }
  }));

export type ConfigurationModel = Instance<typeof Configuration>;

export const ConfigurationStore = types.model({
  configurations: types.map(Configuration),
  // ComponentConfigurationValidateErrors: types.map(ComponentConfigurationValidateErrors),
})
  .views(self => ({
    selectComponentConfigurationWithoutChildren: (id: string, mutable?: boolean): IComponentConfiguration => {
      if (!id || !self.configurations.has(id)) { return null; }
      return self.configurations.get(id).toData(mutable);
    },
    selectComponentConfigurationWithChildren: (id: string): IComponentConfiguration => {
      if (!id || !self.configurations.has(id)) { return null; }
      const parent: EditorStoreModel = getParent(self);
      const tree = parent.treeStore.trees.get(id);
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
      const confs = [];
      if (!id) { return confs };
      const parent: EditorStoreModel = getParent(self);
      const tree = parent.treeStore.trees.get(id);
      if (!tree) { return confs; }
      const slotComponetIds = tree.selectSlotComponetIds(slotProperty);
      slotComponetIds.forEach(bid => {
        if (!self.configurations.has(bid)) { return; }
        confs.push(self.configurations.get(bid).toData());
      });
      return confs;
    },
    selectComponentTitle: (id: string): string => {
      const parent: EditorStoreModel = getParent(self) as any;
      const conf = self.configurations.get(id);
      let title = conf?.title;
      if (title) { return title; }
      const tree = parent.treeStore.trees.get(id);
      if (!tree) { return null; }
      return tree.type;
    },
    selectAllComponentBasicInfo: () => {
      const parent: EditorStoreModel = getParent(self);
      const trees = parent.treeStore.trees;
      const componentIds = trees.keys();
      const infos: Array<{ id: string, type: string, title: string }> = [];
      for (const id of componentIds) {
        const tree = trees.get(id);
        const conf = self.configurations.get(id);
        infos.push({
          id,
          type: tree.type,
          title: conf ? conf.title : '组件'
        });
      }
      return infos;
    }
  }))
  .actions(self => ({
    updateComponentConfiguration: (config: Partial<IComponentConfiguration>) => {
      let conf = self.configurations.get(config.id);
      if (!conf) {
        self.configurations.set(config.id, { id: config.id, type: config.type, title: config.title });
        conf = self.configurations.get(config.id);
      }
      conf.setConfig(config as IComponentConfiguration);
    },
  }));

export type ConfigurationStoreModel = Instance<typeof ConfigurationStore>;
