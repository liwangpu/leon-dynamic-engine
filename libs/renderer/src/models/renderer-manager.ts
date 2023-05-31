import { RendererStoreModel } from '../store';
import { createStore } from '../store';
import { ComponentDiscoveryProvider, IComponentPackage, IComponentDiscovery, IPluginRegister, IDynamicComponentFactory, IDataCenterEngine } from '@lowcode-engine/core';
import { IProjectManager, ProjectSchemaManager } from './project-schema-manager';
import { ISlotManager, SlotManager } from './slot-manager';
import { ComponentFactoryManager } from './component-factory-manager';
import { IStyleManager, StyleManager } from './style-manager';
import { ComponentHierarchyManager, IComponentHierarchyManager } from './hierarchy-manager';
import { ExpressionMonitorManager, IExpressionMonitorManager } from './expression-monitor';
import { DataCenterManager } from './data-center-manager';

export interface IRendererContext {
  /**
   * 数据中心
   */
  store: RendererStoreModel;
  dataCenter: IDataCenterEngine;
  /**
   * 插槽管理器
   */
  slot: ISlotManager;
  /**
   * 组件样式管理器
   */
  style: IStyleManager;
  /**
   * 项目管理器
   */
  project: IProjectManager;
  /**
   * 组件层级管理器
   */
  hierarchy: IComponentHierarchyManager;
  /**
   * 表达式管理器
   */
  expression: IExpressionMonitorManager;
  /**
   * 组件注册服务
   */
  componentDiscovery: IComponentDiscovery;
  /**
   * 动态组件工厂
   */
  componentFactory: IDynamicComponentFactory;
}

export class RendererContextManager implements IRendererContext {

  public readonly slot = new SlotManager(this);
  public readonly style = new StyleManager(this);
  public readonly dataCenter = new DataCenterManager(this);
  public readonly hierarchy = new ComponentHierarchyManager(this);
  public readonly project = new ProjectSchemaManager(this);
  public readonly expression = new ExpressionMonitorManager(this);
  public readonly componentFactory = new ComponentFactoryManager(this);
  public readonly store: any = createStore();
  public readonly componentDiscovery;
  public constructor(public packages: Array<IComponentPackage>) {
    this.componentDiscovery = new ComponentDiscoveryProvider(packages);
  }

}

export type RendererPluginRegister = IPluginRegister<IRendererContext>;