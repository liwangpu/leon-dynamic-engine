import { ComponentDiscoveryContext, DynamicComponentFactoryContext, IComponentConfiguration, IDynamicComponentContainerProps, IDynamicComponentContainerRendererRef, IDynamicComponentProps, useDataCenter, useDynamicComponentEngine } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState, ComponentType, useImperativeHandle, useMemo, memo, forwardRef } from 'react';
import * as _ from 'lodash';
import { useComponentStyle } from '../../hooks';
import classnames from 'classnames';
import { RendererContext } from '../../contexts';
import { IExpressionContext, IExpressionParam } from '../../models';
import { IReactionDisposer, reaction } from 'mobx';

export const DynamicComponent: React.FC<IDynamicComponentProps> = observer(props => {
  const conf = props.configuration;
  const compDiscovery = useContext(ComponentDiscoveryContext);
  const [componentLoaded, setComponentLoaded] = useState(false);
  const Component = useRef<any>(null);

  useEffect(() => {
    if (conf.type) {
      (async () => {
        const module = await compDiscovery.loadComponentRunTimeModule(props.configuration.type, 'pc').then(m => {
          if (!m?.default) { return Promise.resolve(null); }
          return Promise.resolve(m)
        });
        if (module) {
          Component.current = DataCenterDetectorWrapper(UIEffectWrapper(module.default));
          setComponentLoaded(true);
        }
      })();
    }
  }, [conf.type]);

  return (
    <>
      {componentLoaded && <Component.current {...props} />}
    </>
  );
});

DynamicComponent.displayName = 'DynamicComponent';

export const DynamicComponentContainer = observer(forwardRef<IDynamicComponentContainerRendererRef, IDynamicComponentContainerProps>((props, ref) => {
  const { configuration, children: CustomSlotRenderer, direction, className, dropOnly, slot: slotProperty, style } = props;
  const componentId = configuration.id;
  const horizontal = direction === 'horizontal';
  const slotRendererRef = useRef<HTMLDivElement>();
  const containerClassName = useMemo(() => {
    const arr: Array<any> = [
      'dynamic-component-container',
      {
        'dynamic-component-container--horizontal': horizontal,
        'dynamic-component-container--vertical': !horizontal,
      },
    ];

    if (className) {
      if (_.isArray(className)) {
        className.forEach(c => arr.push(c));
      } else {
        arr.push(className);
      }
    }

    return arr;
  }, [className, horizontal]);

  let childrenConfs: Array<IComponentConfiguration> = [];
  if (configuration[slotProperty]) {
    if (_.isArray(configuration[slotProperty])) {
      childrenConfs = configuration[slotProperty];
    } else {
      childrenConfs = [configuration[slotProperty]];
    }
  }

  useImperativeHandle(ref, () => ({
    scrollToEnd: () => {
      const container = slotRendererRef.current;
      if (horizontal) {
        if (container.scrollWidth > container.clientWidth) {
          container.scrollLeft = container.scrollWidth;
        }
      } else if (container.scrollHeight > container.clientHeight) {
        container.scrollTop = container.scrollHeight;
      }
    },
    getContainerRef() {
      return slotRendererRef.current;
    },
  }));

  return (
    <div
      className={classnames(containerClassName)}
      ref={slotRendererRef}
      style={style}
      data-dynamic-component-container={slotProperty}
      data-dynamic-container-direction={direction || 'horizontal'}
      data-dynamic-container-owner={componentId}
      data-dynamic-container-drop-only={_.isNil(dropOnly) ? 'false' : `${dropOnly}`}
    >
      {_.isFunction(CustomSlotRenderer) ?
        CustomSlotRenderer(childrenConfs) : (
          <>
            {childrenConfs.map(c => (<DynamicComponent key={c.id} configuration={c} />))}
          </>
        )
      }
    </div>
  );
}));

DynamicComponentContainer.displayName = 'DynamicComponentContainer';

export const DataCenterDetectorWrapper = (Component: ComponentType<IDynamicComponentProps>) => {

  const wrapper: React.FC<IDynamicComponentProps> = observer(props => {
    const { store } = useContext(RendererContext);
    const factory = useContext(DynamicComponentFactoryContext);
    const conf = props.configuration;
    const { setData, _getState, getVisible } = useDataCenter(conf);
    const style = useComponentStyle(conf);
    const dynamicEngine = useDynamicComponentEngine();
    const field = _.get(props, 'configuration.field');
    const { expressionMonitor } = useContext(RendererContext);

    // const value = store.data.get(field);
    const visible = getVisible();
    // const disabled = store.getFieldDisabled(field);

    const treeInfo = dynamicEngine.hierarchyManager.getTreeInfo(conf.id) || {};

    useEffect(() => {
      const param: IExpressionParam = { current: conf, ...treeInfo };
      const expressionHandlers = expressionMonitor.getHandler(param);
      const disposers: Array<IReactionDisposer> = [];
      const effectKeys: Array<string> = [];
      if (_.isArray(expressionHandlers) && expressionHandlers.length) {
        for (const handler of expressionHandlers) {
          const effects = handler(param);
          if (!effects || !effects.length) { continue; }

          const expressionContext: IExpressionContext = {
            current: conf,
            getState(componentId: string, property: string) {
              return _getState(componentId, property);
            },
            getParent(id: string) {
              return factory.hierarchyManager.getParent(id);
            }
          };

          for (const exp of effects) {
            store.stateStore.setExpressionDefinition(exp);
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
              store.stateStore.setExpressionResult(exp.key, result);
            }, { fireImmediately: true });
            disposers.push(disposer);
          }
        }
      }

      return () => {
        disposers.forEach(disposer => disposer());
        effectKeys.forEach(key => {
          store.stateStore.deleteExpressionDefinition(key);
        });
      };
    }, [props.configuration]);

    const value = null;
    // const visible = true;
    const disabled = false;

    const onChange = (val: any) => {
      // if (!field) { return; }
      // setData(field, val);
    };

    return (
      <>
        {visible && (
          <Component {...props} configuration={props.configuration} disabled={disabled} value={value} onChange={onChange} />
        )}
      </>
    );
  });

  wrapper.displayName = 'DataCenterDetectorWrapper';

  return wrapper;
};

const UIEffectWrapper = (Component: ComponentType<IDynamicComponentProps>) => {

  const wrapper: React.FC<IDynamicComponentProps> = memo(props => {
    const conf = props.configuration;
    const style = useComponentStyle(conf);

    return (
      <div className='dynamic-component'
        style={style}
        data-dynamic-component={conf.id}
        data-dynamic-component-type={conf.type}
      >
        <Component {...props} />
      </div>
    );
  });

  wrapper.displayName = 'UIEffectWrapper';

  return wrapper;
};
