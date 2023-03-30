import React, { memo, useContext, useEffect, useMemo } from 'react';
import { ComponentDiscoveryContext, ComponentDiscoveryProvider, DataCenterEngineContext, DynamicComponentFactoryContext, IComponentPackage, IDataCenterEngine, IProjectSchema, useDynamicComponentEngine } from '@lowcode-engine/core';
import { DynamicComponentFactoryProvider } from '../../models';
import { createStore } from '../../store';
import { DataStoreCollocationContext, DataStoreContext } from '../../contexts';
import * as _ from 'lodash';
import './index.less';

export interface _RendererProps {
  schema: IProjectSchema;
}

export interface DynamicPageProps extends _RendererProps {
  packages: IComponentPackage[];
}

const componentFactory = DynamicComponentFactoryProvider.getInstance();

export const _Renderer: React.FC<_RendererProps> = memo(props => {
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
});

_Renderer.displayName = '_Renderer';

export const Renderer: React.FC<DynamicPageProps> = memo(props => {
  const componentDiscovery = useMemo(() => new ComponentDiscoveryProvider(props.packages), []);
  const collocationContext = useContext(DataStoreCollocationContext);
  const store = useMemo(() => createStore(), []);
  const dataCenterEngine = useMemo<IDataCenterEngine>(() => ({
    setData: (field, val) => {
      store.setData(field, val);
    }
  }), []);

  useEffect(() => {
    if (collocationContext) {
      collocationContext.hosting(store);
    }
  }, []);

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
});

Renderer.displayName = 'Renderer';
