import { Instance, types } from "mobx-state-tree";
import * as _ from 'lodash';
import { InteractionStore } from './interation-store';
import { StructureStore, StateStore, STRUCTURE_INITIAL_STATE, STATE_INITIAL_STATE } from '@lowcode-engine/renderer';

export const INITIAL_STATE = Object.freeze({
  structure: STRUCTURE_INITIAL_STATE,
  interaction: {},
  state: STATE_INITIAL_STATE,
});

const EditorStore = types.model({
  interaction: InteractionStore,
  structure: StructureStore,
  state: StateStore,
}).actions(self => ({
  deleteComponent: (id: string) => {
    const subIds = self.structure.selectAllSubComponentIds(id);
    self.interaction.removeEditingComponent(subIds);
    const currentTree = self.structure.trees.get(id);
    if (currentTree.parentId) {
      self.interaction.activeComponent(currentTree.parentId);
    }
    self.structure.deleteComponent(id);
  },
}));

export const createStore = () => {
  return EditorStore.create(_.cloneDeep(INITIAL_STATE));
}

export type EditorStoreModel = Instance<typeof EditorStore>;