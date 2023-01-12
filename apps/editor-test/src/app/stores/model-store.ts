import { types, flow } from "mobx-state-tree";
import { ModelRepository, IBusinessIModel } from '../models';

export const BusinessModel = types.custom<IBusinessIModel, IBusinessIModel>({
  name: 'BusinessModel',
  fromSnapshot(value: IBusinessIModel) {
    return value;
  },
  toSnapshot(value: IBusinessIModel) {
    return value;
  },
  isTargetType(value: IBusinessIModel): boolean {
    return true;
  },
  getValidationMessage(value: IBusinessIModel): string {
    return null;
  }
});

export const ModelStore = types.model({
  models: types.map(BusinessModel)
})
  .actions(self => ({
    refresh: flow(function* () {
      const models: IBusinessIModel[] = yield ModelRepository.getInstance().query();
      self.models.clear();
      models.forEach(p => {
        self.models.set(p.key, p);
      });
    })
  }));