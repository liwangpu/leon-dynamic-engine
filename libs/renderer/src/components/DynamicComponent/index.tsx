import { IComponentConfiguration, IDynamicComponentContainerProps, IDynamicComponentContainerRendererRef, IDynamicComponentProps, useDataCenter } from '@lowcode-engine/core';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState, useImperativeHandle, useMemo, forwardRef, ComponentType } from 'react';
import * as _ from 'lodash';
import classnames from 'classnames';
import { RendererContext } from '../../contexts';

export const DynamicComponent: React.FC<IDynamicComponentProps> = observer(props => {
  const conf = props.configuration;
  const { componentDiscovery } = useContext(RendererContext);
  const [componentLoaded, setComponentLoaded] = useState(false);
  const Component = useRef<any>(null);

  useEffect(() => {
    if (conf.type) {
      (async () => {
        const module = await componentDiscovery.loadComponentRunTimeModule(props.configuration.type, 'pc').then(m => {
          if (!m?.default) { return Promise.resolve(null); }
          return Promise.resolve(m)
        });
        if (module) {
          Component.current = DataCenterDetectorWrapper(ComponentAttributeWrapper(module.default));
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
    const { store, hierarchy, style: styleManger } = useContext(RendererContext);
    const conf = props.configuration;
    const { setData, _getState, getVisible } = useDataCenter(conf);
    const field = _.get(props, 'configuration.field');
    const visible = getVisible();
    const value = null;
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

export const ComponentAttributeWrapper = (Component: ComponentType<IDynamicComponentProps>) => {

  const wrapper: React.FC<IDynamicComponentProps> = observer(props => {
    const { hierarchy, style: styleManger } = useContext(RendererContext);
    const conf = props.configuration;
    const [style, setStyle] = useState<{ [key: string]: any }>();

    useEffect(() => {
      const treeInfo = hierarchy.getTreeInfo(conf.id) || {};
      const param = { current: conf, ...treeInfo };
      const styleHandlers = styleManger.getHandler(param);

      if (styleHandlers?.length) {
        (async () => {
          const _style = {};
          for (const h of styleHandlers) {
            const s = h(param);
            _.merge(_style, s, props.style || {})
          }
          setStyle(_style);
        })();
      }
    }, [conf]);

    return (
      <Component {...props} style={style} />
    );
  });

  wrapper.displayName = 'DataCenterDetectorWrapper';

  return wrapper;
};
