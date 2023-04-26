import React, { memo, useContext, useEffect, useMemo, useState } from 'react';
import { ComponentDiscoveryContext, ComponentDiscoveryProvider, DataCenterEngineContext, DynamicComponentFactoryContext, IComponentConfiguration, IComponentDiscovery, IComponentHierarchyManager, IComponentHierarchyNode, IComponentPackage, IDataCenterEngine, IDynamicComponentContainerProps, IDynamicComponentContainerRendererRef, IDynamicComponentFactory, IDynamicComponentProps, IProjectSchema, useDynamicComponentEngine } from '@lowcode-engine/core';
import { createStore } from '../../store';
import { DataStoreCollocationContext, DataStoreContext } from '../../contexts';
import * as _ from 'lodash';
import './index.less';
import { DynamicComponent, DynamicComponentContainer } from '../DynamicComponent';

export interface _RendererProps {
  schema: IProjectSchema;
}

export interface DynamicPageProps extends _RendererProps {
  packages: IComponentPackage[];
}

export const _Renderer: React.FC<_RendererProps> = memo(props => {
  const engine = useDynamicComponentEngine();
  const DynamicComponent = engine.getDynamicComponentFactory();
  const validatedSchema = !!(props.schema && props.schema.id && props.schema.type);
  const onChange = (val: any) => {
    //
  };
  return (
    <>
      {validatedSchema && <DynamicComponent configuration={props.schema} />}
    </>
  );
});

_Renderer.displayName = '_Renderer';

export const Renderer: React.FC<DynamicPageProps> = memo(props => {
  const componentDiscovery = useMemo(() => new ComponentDiscoveryProvider(props.packages), [props.packages]);
  const collocationContext = useContext(DataStoreCollocationContext);
  const [componentFactory, setComponentFactory] = useState<IDynamicComponentFactory>();

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

  useEffect(() => {
    (async () => {
      const hierarchyManager = new HierarchyManager(componentDiscovery, props.schema);
      const factory = new ComponentFactory(hierarchyManager);
      await hierarchyManager.initialize();
      setComponentFactory(factory);
    })();
  }, [props.packages, props.schema]);

  return (
    <ComponentDiscoveryContext.Provider value={componentDiscovery}>
      {
        componentFactory && (
          <DynamicComponentFactoryContext.Provider value={componentFactory}>
            <DataStoreContext.Provider value={store}>
              <DataCenterEngineContext.Provider value={dataCenterEngine}>
                <_Renderer schema={props.schema} />
              </DataCenterEngineContext.Provider>
            </DataStoreContext.Provider>
          </DynamicComponentFactoryContext.Provider>
        )
      }
    </ComponentDiscoveryContext.Provider>
  );
});

Renderer.displayName = 'Renderer';

class HierarchyManager implements IComponentHierarchyManager {

  private components = new Map<string, IComponentConfiguration>();
  private trees = new Map<string, IComponentHierarchyNode>();
  public constructor(protected discovery: IComponentDiscovery, protected schema: IProjectSchema) { }

  public getParent(id: string): IComponentConfiguration {
    const treeNode = this.trees.get(id);
    if (!treeNode || !treeNode.parentId) { return null; }

    return this.components.get(treeNode.parentId);
  }

  public getComponentPath(id: string): Array<IComponentConfiguration> {
    const confs: Array<IComponentConfiguration> = [];
    const loop = (subId: string) => {
      confs.push(this.components.get(subId));
      const tree = this.trees.get(subId);
      if (tree.parentId) {
        loop(tree.parentId);
      }
    };
    loop(id);
    // 当前组件就不用放进去了,这个运行时和设计时统一
    confs.splice(0, 1);
    return confs.reverse();
  }

  public async initialize(): Promise<void> {
    const { configurations, trees } = await this.discovery.analyseSchema(this.schema);
    this.components = configurations;
    this.trees = trees;
  }

}

class ComponentFactory implements IDynamicComponentFactory {

  public constructor(public hierarchyManager: IComponentHierarchyManager) { }

  public getDynamicComponentFactory(): React.ComponentType<IDynamicComponentProps<IComponentConfiguration>> {
    return DynamicComponent;
  }

  public getDynamicComponentContainerFactory(): React.ForwardRefExoticComponent<IDynamicComponentContainerProps & React.RefAttributes<IDynamicComponentContainerRendererRef>> {
    return DynamicComponentContainer;
  }

}
