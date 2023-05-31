import type { Instance} from "mobx-state-tree";
import { types } from "mobx-state-tree";
import { StateStore, STATE_INITIAL_STATE } from './state-store';
import { STRUCTURE_INITIAL_STATE, StructureStore } from './structure-store';

export const RendererStore = types.model({
  state: StateStore,
  structure: StructureStore,
});

export const createStore = () => {
  return RendererStore.create({
    state: STATE_INITIAL_STATE,
    structure: STRUCTURE_INITIAL_STATE,
  });
};

export type RendererStoreModel = Instance<typeof RendererStore>;
