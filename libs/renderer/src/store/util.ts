import { IComponentConfiguration } from '@lowcode-engine/core';
import * as _ from 'lodash';
import { SnapshotIn } from 'mobx-state-tree';
import { ComponentTreeModel, ConfigurationModel, STRUCTURE_INITIAL_STATE, StructureStoreModel } from './structure-store';

export interface IComponentSlotMap {
  [componentType: string]: Array<string>;
}

export interface ISlotSingletonMap {
  [componentTypeAndSlotProperty: string]: boolean;
}

function getSingletonMapKey(componentType: string, slotProperty: string) {
  return `${componentType}@${slotProperty}`;
}

function getHierarchyProperties(slotMap: IComponentSlotMap, componentType: string) {
  const properties = slotMap[componentType] || [];
  return properties;
}

export function generateDesignState(metadata: IComponentConfiguration, slotMap: IComponentSlotMap = {}, singletonMap: ISlotSingletonMap = {}): SnapshotIn<any> {
  const state: SnapshotIn<StructureStoreModel> = _.cloneDeep(STRUCTURE_INITIAL_STATE);
  if (!metadata) { return state; }
  const componentTrees: { [id: string]: SnapshotIn<ComponentTreeModel> } = {};
  const componentConfigurations: { [id: string]: SnapshotIn<ConfigurationModel> } = {};

  const generateComponentMetadataAndTree = (md: IComponentConfiguration, parentId?: string, slotProperty?: string, singleton?: boolean) => {
    const id: string = md.id!;
    const ctree: SnapshotIn<ComponentTreeModel> = { id, type: md.type };
    if (parentId) {
      ctree.parentId = parentId;
    }

    if (slotProperty) {
      ctree.slotProperty = slotProperty;
    }

    componentTrees[id] = ctree;
    md = { ...md };

    const properties = getHierarchyProperties(slotMap, md.type);
    for (let property of properties) {
      let childrenMetadatas = [];
      const k = getSingletonMapKey(md.type, property);
      const isSingleton = singletonMap[k];
      if (md[property]) {
        if (isSingleton) {
          childrenMetadatas.push(md[property]);
        } else {
          childrenMetadatas = md[property];
        }
      }

      if (childrenMetadatas.length) {
        const childrenIds = childrenMetadatas.map(c => c.id);
        if (childrenIds.length) {
          const slots = ctree.slots || {};
          slots[property] = childrenIds as any;
          ctree.slots = slots;
        }
        childrenMetadatas.forEach(cmd => {
          generateComponentMetadataAndTree(cmd, id, property, isSingleton);
        });
      }
      delete md[property];
    }
    componentConfigurations[id] = { id, type: md.type, title: md.title, origin: md };
  };

  generateComponentMetadataAndTree(metadata);

  state.trees = componentTrees;
  state.configurations = componentConfigurations;
  return state;
}

export function nestComponentTree(state: SnapshotIn<StructureStoreModel>, slotMap: IComponentSlotMap = {}, singletonMap: ISlotSingletonMap = {}): IComponentConfiguration {
  const treeIds = Object.keys(state.trees);
  const configIds = Object.keys(state.configurations);
  const getTree = (id: string) => {
    return state.trees[id];
  };

  const generateConfig = (id: string): IComponentConfiguration => {
    const tree = getTree(id);
    const hasConfig = configIds.some(cid => cid === id);
    let conf: IComponentConfiguration = hasConfig ? { ...state.configurations[id].origin } : { id };
    conf.type = tree.type;
    return conf;
  };

  const componentConfMap = new Map<string, IComponentConfiguration>();
  treeIds.forEach(id => {
    componentConfMap.set(id, generateConfig(id));
  });

  const supplementChildrenConfig = (componentId: string) => {
    if (!componentId) { return; }
    const tree = getTree(componentId);
    const conf = componentConfMap.get(componentId);
    const properties = getHierarchyProperties(slotMap, conf.type);
    for (let property of properties) {
      let propertyIds: Array<string> = tree.slots[property] as any || [];
      if (propertyIds.length) {
        const singletonMapKey = getSingletonMapKey(conf.type, property);
        const isSingleton = singletonMap[singletonMapKey];
        if (isSingleton) {
          conf[property] = componentConfMap.get(propertyIds[0]);
        } else {
          conf[property] = propertyIds.map(cid => componentConfMap.get(cid));
        }

        propertyIds.forEach(cid => supplementChildrenConfig(cid));
      }
    }
  };

  const rootId = state.rootComponentId;
  supplementChildrenConfig(rootId);

  return componentConfMap.get(rootId);
}