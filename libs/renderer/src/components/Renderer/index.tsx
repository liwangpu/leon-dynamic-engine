import React, { memo, useContext, useEffect, useMemo, useState } from 'react';
import { ComponentDiscoveryContext, ComponentDiscoveryProvider, DataCenterEngineContext, DynamicComponentFactoryContext, IComponentConfiguration, IComponentDiscovery, IComponentHierarchyManager, IComponentHierarchyNode, IComponentPackage, IDataCenterEngine, IDynamicComponentContainerProps, IDynamicComponentContainerRendererRef, IDynamicComponentFactory, IDynamicComponentProps, IProjectSchema, useDynamicComponentEngine, useStoreMonitorHosting } from '@lowcode-engine/core';
import * as _ from 'lodash';
import './index.less';
import { DynamicComponent, DynamicComponentContainer } from '../DynamicComponent';
import { STORE_NAME } from '../../consts';
import { IRendererContext, RendererManager } from '../../models';
import { ExpressionMonitorRegisterContext, RendererContext } from '../../contexts';

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

  const expressionMonitorRegister = useContext(ExpressionMonitorRegisterContext);

  const rendererContext = useMemo<IRendererContext>(() => {
    const ctx = new RendererManager();
    if (_.isArray(expressionMonitorRegister)) {
      for (const register of expressionMonitorRegister) {
        const r = register(ctx);
        if (_.isArray(r)) {
          ctx.expressionMonitor.registerMonitor(...r);
        }
      }
    }
    return ctx;
  }, []);

  useStoreMonitorHosting(STORE_NAME, rendererContext.store);

  const dataCenterEngine = useMemo<IDataCenterEngine>(() => ({
    setData(field, val) {
      rendererContext.store.dataStore.setData(field, val);
    },
    setState(componentId, property, data) {
      rendererContext.store.stateStore.setState(componentId, property, data);
    },
    getState(componentId, property) {
      return rendererContext.store.stateStore.getState(componentId, property);
    },
    getVisible(componentId) {
      return rendererContext.store.stateStore.getVisible(componentId);
    },
  }), []);

  return (
    <RendererContext.Provider value={rendererContext}>
      <DataCenterEngineContext.Provider value={dataCenterEngine}>
        {validatedSchema && <DynamicComponent configuration={props.schema} />}
      </DataCenterEngineContext.Provider>
    </RendererContext.Provider>
  );
});

_Renderer.displayName = '_Renderer';

export const Renderer: React.FC<DynamicPageProps> = memo(props => {
  const componentDiscovery = useMemo(() => new ComponentDiscoveryProvider(props.packages), [props.packages]);

  const [componentFactory, setComponentFactory] = useState<IDynamicComponentFactory>();

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
            <_Renderer schema={props.schema} />
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

  public getTreeInfo(id: string): { parent?: IComponentConfiguration, slot?: string, index?: number } {
    const treeNode = this.trees.get(id);
    if (!treeNode) { return null; }

    return {
      parent: treeNode.parentId ? this.components.get(treeNode.parentId) : null,
      slot: treeNode.slotProperty,
      index: treeNode.slotIndex,
    };

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
