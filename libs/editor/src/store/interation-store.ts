import { types } from "mobx-state-tree";
import * as _ from 'lodash';

export const InteractionStore = types.model({
  rootId: types.maybeNull(types.string),
  activeComponentId: types.maybeNull(types.string),
  editingComponentIds: types.optional(types.array(types.string), [])
})
  .actions(self => ({
    activeComponent: (id: string) => {
      self.activeComponentId = id;
      if (!self.editingComponentIds.some(eid => eid === id)) {
        self.editingComponentIds.push(id);
      }
    },
    clearEditings: () => {
      self.editingComponentIds.clear();
    },
    removeEditingComponent: (ids: string | Array<string>) => {
      if (_.isArray(ids)) {
        (ids as Array<string>).forEach(id => {
          self.editingComponentIds.remove(id);
        });
      } else {
        self.editingComponentIds.remove(ids);
      }
    }
  }));