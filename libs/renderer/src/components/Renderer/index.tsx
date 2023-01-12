import React, { memo, useEffect, useMemo } from 'react';
import { ComponentDiscoveryContext, ComponentDiscoveryProvider, DataCenterEngineContext, DynamicComponentFactoryContext, IComponentConfiguration, IComponentPackage, IDataCenterEngine, IInteraction, InteractionType, IProjectSchema, useDynamicComponentEngine } from '@tiangong/core';
import { observer } from 'mobx-react-lite';
import { DynamicComponentFactoryProvider } from '../../models';
import { createStore } from '../../store';
import { connectReduxDevtools } from 'mst-middlewares';
import { DataStoreContext } from '../../contexts';
import * as _ from 'lodash';
import { reaction } from 'mobx';
import { usePageRuleInteraction } from '../../hooks';

export interface _RendererProps {
  schema: IProjectSchema;
}

export interface DynamicPageProps extends _RendererProps {
  packages: IComponentPackage[];
}

const componentFactory = DynamicComponentFactoryProvider.getInstance();

export const _Renderer: React.FC<_RendererProps> = memo(observer(props => {
  const engine = useDynamicComponentEngine();
  const DynamicComponent = engine.getDynamicComponentRenderFactory();
  const validatedSchema = !!(props.schema && props.schema.id && props.schema.type);
  const onChange = (val: any) => {
    //
  };
  return (
    <>
      {validatedSchema && <DynamicComponent configuration={props.schema} onChange={onChange} />}
    </>
  );
}));

_Renderer.displayName = '_Renderer'; 

// interface IInteractionEffect {
//   expressions?: Array<IExpression>;
//   interactions?: Array<IInteraction>;
// }

export const Renderer: React.FC<DynamicPageProps> = memo(observer(props => {
  const componentDiscovery = useMemo(() => new ComponentDiscoveryProvider(props.packages), []);
  const store = useMemo(() => createStore(), []);
  const rules = props.schema && props.schema.rules;
  const dataCenterEngine = useMemo<IDataCenterEngine>(() => ({
    setData: (field, val) => {
      store.setData(field, val);
    }
  }), []);
  // usePageRuleInteraction(store, rules);
  // useEffect(() => {
  //   connectReduxDevtools(require("remotedev"), store);
  //   // 解析页面规则为IInteractionEffect格式
  //   const interactionEffects: Array<IInteractionEffect> = [];
  //   const anylysis = (rule: IExpression, expLinks: Array<IExpression>) => {
  //     expLinks.push({
  //       field: rule.field,
  //       operator: rule.operator,
  //       value: rule.value
  //     });
  //     if (rule.interactions?.length) {
  //       interactionEffects.push({
  //         expressions: [...expLinks],
  //         interactions: [...rule.interactions]
  //       });
  //     }
  //     if (rule.sub?.length) {
  //       rule.sub.forEach(sr => anylysis(sr, [...expLinks]));
  //     }
  //   }

  //   // rules.forEach(r => {
  //   //   anylysis(r, []);
  //   // });

  //   console.log(`interactionEffects:`, interactionEffects);
  //   const reactionDisposers = [];
  //   // 建立联动监听
  //   for (let ef of interactionEffects) {
  //     if (!ef.expressions?.length || !ef.interactions?.length) {
  //       continue;
  //     }
  //     const disposer = reaction(() => {
  //       const results: Array<boolean> = [];
  //       for (let exp of ef.expressions) {
  //         const fieldValue = store.data.get(exp.field);
  //         const jsExpression = `return ${fieldValue}${exp.operator}${exp.value}`;
  //         const jsFn = new Function(jsExpression);
  //         const result = jsFn.apply({});
  //         // console.log(`jsExpression:`,jsExpression,result);
  //         results.push(result);
  //       }
  //       return !results.some(r => !r);
  //     }, (result, prev) => {
  //       for (let it of ef.interactions) {
  //         switch (it.type) {
  //           case InteractionType.hideField:
  //             store.setVisible(it.effectedField, !result);
  //             break;
  //           case InteractionType.setDisabled:
  //             store.setDisabled(it.effectedField, result);
  //             break;
  //           default:
  //             break;
  //         }
  //       }

  //     }, { fireImmediately: true });
  //     reactionDisposers.push(disposer);
  //   }

  //   return () => {
  //     reactionDisposers.forEach(disposer => disposer());
  //   };
  // }, [rules]);

  return (
    <ComponentDiscoveryContext.Provider value={componentDiscovery}>
      <DynamicComponentFactoryContext.Provider value={componentFactory}>
        <DataStoreContext.Provider value={store}>
          <DataCenterEngineContext.Provider value={dataCenterEngine}>
            <_Renderer schema={props.schema} />
          </DataCenterEngineContext.Provider>
        </DataStoreContext.Provider>
      </DynamicComponentFactoryContext.Provider>
    </ComponentDiscoveryContext.Provider>
  );
}));

Renderer.displayName = 'Renderer';
