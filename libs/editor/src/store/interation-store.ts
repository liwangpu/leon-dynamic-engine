import { types } from "mobx-state-tree";
import * as _ from 'lodash';

export const InteractionStore = types.model({
  pageComponentId: types.maybeNull(types.string),
  activeComponentId: types.maybeNull(types.string),
  editingComponentIds: types.optional(types.array(types.string), [])
})
  .actions(self => ({
    activeComponent: (id: string): void => {
      self.activeComponentId = id;
      if (!self.editingComponentIds.some(eid => eid === id)) {
        self.editingComponentIds.push(id);
      }
    }
  }));