import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { RendererContext } from '../../contexts';
import { IReactionDisposer, reaction, values } from 'mobx';
import { IExpressionContext, IExpressionParam } from '../../models';
import * as _ from 'lodash';

const ComponentDetector: React.FC<{ componentId: string }> = observer(({ componentId }) => {

  const { store, hierarchy, expression,dataCenter } = useContext(RendererContext);
  const conf = store.structure.selectComponentConfigurationWithChildren(componentId);
  const treeInfo = hierarchy.getTreeInfo(conf.id) || {};

  useEffect(() => {
    const param: IExpressionParam = { current: conf, ...treeInfo };
    const expressionHandlers = expression.getHandler(param);
    const disposers: Array<IReactionDisposer> = [];
    const effectKeys: Array<string> = [];
    if (_.isArray(expressionHandlers) && expressionHandlers.length) {
      for (const handler of expressionHandlers) {
        const effects = handler(param);
        if (!effects || !effects.length) { continue; }

        const expressionContext: IExpressionContext = {
          current: conf,
          getState(componentId: string, property: string) {
            return dataCenter.getState(componentId, property);
          },
          getParent(id: string) {
            return hierarchy.getParent(id);
          }
        };

        for (const exp of effects) {
          store.state.setExpressionDefinition(exp);
          effectKeys.push(exp.key);
          const disposer = reaction(() => {
            const jsFn = new Function(exp.expression);
            let result: any;
            try {
              result = jsFn.apply(expressionContext);
            } catch (error) {
              console.error(`表达式执行失败,表达式信息为:`, expressionContext);
            }
            return result;
          }, (result, prev) => {
            store.state.setExpressionResult(exp.key, result);
          }, { fireImmediately: true });
          disposers.push(disposer);
        }
      }
    }

    return () => {
      disposers.forEach(disposer => disposer());
      effectKeys.forEach(key => {
        store.state.deleteExpressionDefinition(key);
      });
    };
  }, [conf, treeInfo]);

  return (
    <></>
  );
});

ComponentDetector.displayName = 'ComponentDetector';

const ExpressionDetector: React.FC = observer(() => {

  const { store } = useContext(RendererContext);
  const components = values<{ id: string }>(store.structure.trees as any);

  return (
    <>
      {components.map(t => (<ComponentDetector componentId={t.id} key={t.id} />))}
    </>
  );
});

ExpressionDetector.displayName = 'ExpressionDetector';

export default ExpressionDetector;