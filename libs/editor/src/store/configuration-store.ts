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
      self.type = conf.type;
      self.title = conf.title;
      self.origin = _.pickBy(self.origin ? { ...self.origin, ...conf } : { ...conf, id: self.id }, _.identity);
    }
  }));

export type ConfigurationModel = Instance<typeof Configuration>;

export const ConfigurationStore = types.model({
  configurations: types.map(Configuration),
  // ComponentConfigurationValidateErrors: types.map(ComponentConfigurationValidateErrors),
})
  .views(self => ({
    selectComponentConfigurationWithoutChildren: (id: string): IComponentConfiguration => {
      if (!id || !self.configurations.has(id)) { return null; }
      return self.configurations.get(id).toData();
    },
    selectComponentConfigurationWithChildren: (id: string): IComponentConfiguration => {
      if (!id || !self.configurations.has(id)) { return null; }

      return null;
    },
    selectComponentFirstLayerChildren: (id: string, slotProperty: string): Array<IComponentConfiguration> => {
      const parent: EditorStoreModel = getParent(self);
      const tree = parent.treeStore.trees.get(id);
      const slotComponetIds = tree.selectSlotComponetIds(slotProperty);
      const confs = [];
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
    }
  }))
  .actions(self => ({
    updateComponentConfiguration: (config: IComponentConfiguration) => { 
      let conf = self.configurations.get(config.id);
      // debugger;
      if (!conf) {
        self.configurations.set(config.id, { id: config.id, type: config.type, title: config.title });
        conf = self.configurations.get(config.id);
      }
      conf.setConfig(config);
    }
  }));

export type ConfigurationStoreModel = Instance<typeof ConfigurationStore>;
