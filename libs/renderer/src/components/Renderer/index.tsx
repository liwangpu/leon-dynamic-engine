import React, { memo, useMemo } from 'react';
import { ComponentDiscoveryContext, ComponentDiscoveryProvider, DataCenterEngineContext, DynamicComponentFactoryContext, IComponentPackage, IDataCenterEngine, IProjectSchema, useDynamicComponentEngine } from '@tiangong/core';
import { observer } from 'mobx-react-lite';
import { DynamicComponentFactoryProvider } from '../../models';
import { createStore } from '../../store';
import { DataStoreContext } from '../../contexts';
import * as _ from 'lodash';

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

export const Renderer: React.FC<DynamicPageProps> = memo(observer(props => {
  const componentDiscovery = useMemo(() => new ComponentDiscoveryProvider(props.packages), []);
  const store = useMemo(() => createStore(), []);
  const dataCenterEngine = useMemo<IDataCenterEngine>(() => ({
    setData: (field, val) => {
      store.setData(field, val);
    }
  }), []);

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
