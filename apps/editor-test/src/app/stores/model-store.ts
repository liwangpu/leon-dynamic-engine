import { IBusinessModel } from '@lowcode-engine/primary-plugin';
import { types, flow } from "mobx-state-tree";
import { ModelRepository } from '../models';

export const BusinessModel = types.custom<IBusinessModel, IBusinessModel>({
  name: 'BusinessModel',
  fromSnapshot(value: IBusinessModel) {
    return value;
  },
  toSnapshot(value: IBusinessModel) {
    return value;
  },
  isTargetType(value: IBusinessModel): boolean {
    return true;
  },
  getValidationMessage(value: IBusinessModel): string {
    return null;
  }
});

export const ModelStore = types.model({
  models: types.map(BusinessModel)
})
  .actions(self => ({
    refresh: flow(function* () {
      const models: IBusinessModel[] = yield ModelRepository.getInstance().query();
      self.models.clear();
      models.forEach(p => {
        self.models.set(p.id, p);
      });
    })
  }));