import { Instance, types, applySnapshot } from "mobx-state-tree";
import { DataStore } from './data-store';
import { StateStore } from './state-store';

export const RendererStore = types.model({
  dataStore: DataStore,
  stateStore: StateStore,
});

export const createStore = () => {
  return RendererStore.create({
    dataStore: {},
    stateStore: {},
  });
};

export type RendererStoreModel = Instance<typeof RendererStore>;