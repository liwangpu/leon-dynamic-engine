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

// const componentFactory: IDynamicComponentFactory = {
//   hierarchyManager: null,
//   getDynamicComponentFactory: () => {
//     return DynamicComponent;
//   },
//   getDynamicComponentContainerFactory: () => {
//     return DynamicComponentContainer;
//   },
// };

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

  private readonly componentConfMap = new Map<string, IComponentConfiguration>();
  private readonly treeNodeMap = new Map<string, IComponentHierarchyNode>();
  public constructor(protected discovery: IComponentDiscovery, protected schema: IProjectSchema) {

  }

  public getParent(id: string): IComponentConfiguration {
    const treeNode = this.treeNodeMap.get(id);
    if (!treeNode || !treeNode.parentId) { return null; }

    return this.componentConfMap.get(treeNode.parentId);
  }

  public async initialize(): Promise<void> {
    if (!this.schema) { return; }
    const slotInfoMap = await this.discovery.queryComponentSlotInfo();
    const traverseComponent = (conf: IComponentConfiguration, parentId?: string, slotProperty?: string) => {
      /**
       * 这里遍历项目的schema,主要做以下几件事
       *  生成扁平组件树节点
       *  记录下组件配置节点的引用
       */
      const treeNode: IComponentHierarchyNode = {
        id: conf.id,
        type: conf.type,
        parentId,
        slotProperty,
        slots: {}
      };
      this.componentConfMap.set(conf.id, conf);
      const slotInfo = slotInfoMap[conf.type];

      if (slotInfo) {
        for (const slot in slotInfo) {
          const definition = slotInfo[slot];
          if (!conf[slot]) { continue; }
          const children: Array<IComponentConfiguration> = definition.singleton ? [conf[slot]] : conf[slot];
          children.forEach(c => {
            traverseComponent(c, conf.id, slot);
          });
          treeNode.slots[slot] = children.map(c => c.id);
        }
      }

      this.treeNodeMap.set(treeNode.id, treeNode);
    };

    traverseComponent(this.schema);
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
