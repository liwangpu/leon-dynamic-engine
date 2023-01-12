
import { Instance, types } from "mobx-state-tree";
import { ModelStore } from './model-store';
import { PageStore } from './page-store';

export type RootStoreModel = Instance<typeof RootStore>;

export const RootStore = types.model("RootStore", {
  pageStore: PageStore,
  modelStore: ModelStore
});

export const createStore = (): RootStoreModel => {

  return RootStore.create({ pageStore: {}, modelStore: {} });
}
