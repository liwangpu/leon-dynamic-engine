import { ComponentDiscoveryContext, IDynamicComponentProps, useDataCenter } from '@tiangong/core';
import { observer } from 'mobx-react-lite';
import React, { memo, useContext, useEffect, useRef, useState, ComponentType } from 'react';
import { DataStoreContext } from '../../contexts';
import * as _ from 'lodash';

const DynamicComponent: React.FC<IDynamicComponentProps> = memo(observer(props => {
  const conf = props.configuration;
  const compDiscovery = useContext(ComponentDiscoveryContext);
  const [componentLoaded, setComponentLoaded] = useState(false);
  const Component = useRef<any>(null);

  useEffect(() => {
    if (props.configuration?.type) {
      (async () => {
        const module = await compDiscovery.loadComponentRunTimeModule(props.configuration.type, 'pc').then(m => {
          if (!m?.default) { return Promise.resolve(null); }
          return Promise.resolve(m)
        });
        if (module) {
          Component.current = EditorUIEffectWrapper(module.default);
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
}));

DynamicComponent.displayName = 'DynamicComponent';

export default DynamicComponent;

const EditorUIEffectWrapper = (Component: ComponentType<IDynamicComponentProps>) => {

  const wrapper: React.FC<IDynamicComponentProps> = memo(observer(props => {
    const store = useContext(DataStoreContext);
    const { setData } = useDataCenter();
    const field = _.get(props, 'configuration.field');
    const value = store.data.get(field);
    const visible = store.getFieldVisible(field);
    const disabled = store.getFieldDisabled(field);
    const onChange = (val: any) => {
      if (!field) { return; }
      setData(field, val);
    };
    return (
      <>
        {visible && <Component configuration={props.configuration} disabled={disabled} value={value} onChange={onChange} />}
      </>
    );
  }));

  return wrapper;
};
