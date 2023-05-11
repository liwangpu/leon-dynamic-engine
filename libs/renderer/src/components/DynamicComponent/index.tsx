import { ComponentDiscoveryContext, IComponentConfiguration, IDynamicComponentContainerProps, IDynamicComponentContainerRendererRef, IDynamicComponentProps, useDataCenter, useDynamicComponentEngine } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState, ComponentType, useImperativeHandle, useMemo, memo, forwardRef } from 'react';
import * as _ from 'lodash';
import { useComponentStyle } from '../../hooks';
import classnames from 'classnames';
import { RendererContext } from '../../contexts';
import { IExpressionParam } from '../../models';

export const DynamicComponent: React.FC<IDynamicComponentProps> = memo(props => {
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
          Component.current = DataCenterDetectorWrapper(module.default);
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

export const DynamicComponentContainer = memo(forwardRef<IDynamicComponentContainerRendererRef, IDynamicComponentContainerProps>((props, ref) => {
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

const DataCenterDetectorWrapper = (Component: ComponentType<IDynamicComponentProps>) => {

  const wrapper: React.FC<IDynamicComponentProps> = observer(props => {
    // const store = useContext(DataStoreContext);
    const conf = props.configuration;
    const { setData } = useDataCenter(conf);
    const style = useComponentStyle(conf);
    const dynamicEngine = useDynamicComponentEngine();
    const field = _.get(props, 'configuration.field');
    const { expressionMonitor } = useContext(RendererContext);
    // 
    // const value = store.data.get(field);
    // const visible = store.getFieldVisible(field);
    // const disabled = store.getFieldDisabled(field);
    // const p=
    // console.log(`path:`, conf.id, dynamicEngine.hierarchyManager.getTreeInfo(conf.id));
    const treeInfo = dynamicEngine.hierarchyManager.getTreeInfo(conf.id) || {};
    const param: IExpressionParam = { current: conf, ...treeInfo };
    const expressionHandlers = expressionMonitor.getHandler(param);
    if (_.isArray(expressionHandlers) && expressionHandlers.length) {
      // console.log(`expressionHandlers:`, expressionHandlers);
      for (const handler of expressionHandlers) {
        const effects = handler(param);
        console.log(`effects:`,effects);
      }

    }

    const value = null;
    const visible = true;
    const disabled = false;

    const onChange = (val: any) => {
      if (!field) { return; }
      setData(field, val);
    };

    return (
      <>
        {visible && (
          <div className='dynamic-component'
            style={style}
            data-dynamic-component={conf.id}
            data-dynamic-component-type={conf.type}
          >
            <Component configuration={props.configuration} disabled={disabled} value={value} onChange={onChange} />
          </div>
        )}
      </>
    );
  });

  wrapper.displayName = 'DataCenterDetectorWrapper';

  return wrapper;
};
