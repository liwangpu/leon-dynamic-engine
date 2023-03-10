import { Instance, types, applySnapshot } from "mobx-state-tree";

const DataStore = types.model({
  data: types.map(types.frozen()),
  visibility: types.map(types.boolean),
  disabled: types.map(types.boolean)
})
  .views(self => ({
    getFieldVisible: (field: string) => {
      if (!field || !self.visibility.has(field)) {
        return true;
      }

      return self.visibility.get(field);
    },
    getFieldDisabled: (field: string) => {
      if (!field || !self.disabled.has(field)) {
        return false;
      }
      return self.disabled.get(field);
    }
  }))
  .actions(self => ({
    setData: (field: string, val: any) => {
      self.data.set(field, val);
    },
    setVisible: (field: string, visible: boolean) => {
      self.visibility.set(field, visible);
    },
    setDisabled: (field: string, disabled: boolean) => {
      self.disabled.set(field, disabled);
    }
  }));

export type DataStoreModel = Instance<typeof DataStore>;

export const createStore = () => {
  return DataStore.create({
    data: {
      age: 18,
      height:200
    }
  });
}