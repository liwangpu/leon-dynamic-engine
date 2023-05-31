import { Instance, types, getParent } from "mobx-state-tree";
import { IExpressionEffect } from '../models';
import * as _ from 'lodash';

const ExpressionDefinition = types.model({
  componentId: types.string,
  expression: types.string,
  target: types.string,
  property: types.string,
  rank: types.number,
});

const ExpressionItemResult = types.model({
  rank: types.number,
  result: types.frozen(),
});

const PropertyCalculateInfo = types.model({
  property: types.string,
  calculate: types.map(ExpressionItemResult),
  result: types.frozen(),
});

const ComponentExpressionResult = types.model({
  componentId: types.string,
  properties: types.map(PropertyCalculateInfo),
})
  .views(self => ({
    getPropertyResult: (property: string) => {
      let info = self.properties.get(property);
      if (!info) { return; }
    },
  }))
  .actions(self => ({
    updateResultToMapping: (property: string) => {
      const store = getParent<typeof StateStore>(getParent(self));
      let propertyInfo = self.properties.get(property);
      // 取出优先级最高的作为propery result最终计算结果
      let maxRank: number = -1;
      let maxRankKey: string;
      propertyInfo.calculate.forEach((it, key) => {
        if (it.rank > maxRank) {
          maxRank = it.rank;
          maxRankKey = key;
        }
      });

      propertyInfo.result = maxRankKey ? propertyInfo.calculate.get(maxRankKey).result : undefined;
      // 把属性同步到状态中心
      switch (property) {
        case 'visible':
          if (!_.isNil(propertyInfo.result)) {
            store.visible.set(self.componentId, propertyInfo.result);
          } else {
            store.visible.delete(self.componentId);
          }
          break;
        default:
          break;
      }
    },
    checkAnddestroyIfNoSense: (property: string) => {
      if (!self.properties.get(property).calculate.size) {
        self.properties.delete(property);
      }

      if (!self.properties.size) {
        const store = getParent<typeof StateStore>(getParent(self));
        store.expressionResults.delete(self.componentId);
      }
    }
  }))
  .actions(self => ({
    setPropertyResult: (key: string, result: any) => {
      const store = getParent<typeof StateStore>(getParent(self));
      const exp = store.expressionDefinitions.get(key);
      let propertyInfo = self.properties.get(exp.property);
      if (!propertyInfo) {
        self.properties.set(exp.property, { property: exp.property, calculate: {} });
        propertyInfo = self.properties.get(exp.property)
      }

      propertyInfo.calculate.set(key, { rank: exp.rank, result });
      // 更新计算结果映射
      self.updateResultToMapping(exp.property);
    },
    deletePropertyResult: (key: string) => {
      const store = getParent<typeof StateStore>(getParent(self));
      const exp = store.expressionDefinitions.get(key);
      let propertyInfo = self.properties.get(exp.property);
      if (!propertyInfo) { return; }

      propertyInfo.calculate.delete(key);
      // 更新计算结果映射
      self.updateResultToMapping(exp.property);
      // 删除掉没有意义的表达结果
      self.checkAnddestroyIfNoSense(exp.property);
    },
  }));

export const StateStore = types.model({
  expressionDefinitions: types.map(ExpressionDefinition),
  expressionResults: types.map(ComponentExpressionResult),
  state: types.map(types.map(types.frozen())),
  visible: types.map(types.boolean),
  disabled: types.map(types.boolean),
})
  .views(self => ({
    getState: (componentId: string, property: string) => {
      const componentState = self.state.get(componentId);
      if (!componentState) { return; }
      return componentState.get(property);
    },
    getVisible: (componentId: string) => {
      if (self.visible.has(componentId)) {
        return self.visible.get(componentId);
      }
      return true;
    },
  }))
  .actions(self => ({
    setState: (componentId: string, property: string, data?: any) => {
      if (!self.state.has(componentId)) {
        self.state.set(componentId, {})
      }
      let m = self.state.get(componentId);
      m.set(property, data);
    },
    setExpressionDefinition: (effect: IExpressionEffect) => {
      if (!effect || !effect.key) { return; }
      self.expressionDefinitions.set(effect.key, effect);
    },
    deleteExpressionDefinition: (key: string) => {
      const exp = self.expressionDefinitions.get(key);
      const componentId = exp.target;
      let componentExpression = self.expressionResults.get(componentId);
      if (!componentExpression) { return; }

      componentExpression.deletePropertyResult(key);
      self.expressionDefinitions.delete(key);
    },
    setExpressionResult: (key: string, result: any) => {
      const exp = self.expressionDefinitions.get(key);
      const componentId = exp.target;
      let componentExpression = self.expressionResults.get(componentId);
      if (!componentExpression) {
        self.expressionResults.set(componentId, { componentId, properties: {} });
        componentExpression = self.expressionResults.get(componentId);
      }

      componentExpression.setPropertyResult(key, result);
    },
  }));


export type StateStoreModel = Instance<typeof StateStore>;

export const STATE_INITIAL_STATE = Object.freeze({
  expressionDefinitions: {},
  expressionResults: {},
  state: {},
  visible: {},
  disabled: {},
});