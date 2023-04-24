import { ComponentDiscoveryProvider, IComponentDiscovery, IComponentPackage } from '@lowcode-engine/core';
import { createStore, EditorStoreModel } from '../store';
import { ConfigurationAddingEffectManager, IConfigurationAddingEffectManager, IConfigurationDeleteEffectManager, IConfigurationTypeTransferEffectManager, ConfigurationTypeTransferEffectManager, ConfigurationDeleteEffectManager } from './configuration-effect-manager';
import { ConfigurationManager, IConfigurationManager } from './configuration-manager';
import { DomManager, IDomManager } from './dom-manager';
import { EditorStorage, IEditorStorage } from './editor-storage';
import { EventManager, IEventManager } from './event-manager';
import { IProjectManager, ProjectSchemaManager } from './project-schema-manager';
import { ISkeletonManager, SkeletonManager } from './skeleton-manager';
import { ISlotManager, SlotManager } from './slot-manager';

export interface IEditorContext {
  /**
   * 扩展面板管理器
   */
  skeleton: ISkeletonManager;
  /**
   * 项目管理器
   */
  project: IProjectManager;
  /**
   * 组件注册服务
   */
  componentDiscovery: IComponentDiscovery;
  /**
   * 事件中心管理器
   */
  event: IEventManager;
  /**
   * 插槽管理器
   */
  slot: ISlotManager;
  /**
   * 组件配置管理器
   */
  configuration: IConfigurationManager;
  configurationAddingEffect: IConfigurationAddingEffectManager;
  configurationDeleteEffect: IConfigurationDeleteEffectManager;
  configurationTypeTransferEffect: IConfigurationTypeTransferEffectManager;
  // 组件dom管理器
  dom: IDomManager;
  store: EditorStoreModel;
  storage: IEditorStorage;
}

export class EditorContextManager implements IEditorContext {

  public readonly skeleton = new SkeletonManager(this);
  public readonly project = new ProjectSchemaManager(this);
  public readonly dom = new DomManager(this);
  public readonly event = new EventManager(this);
  public readonly slot = new SlotManager(this);
  public readonly configurationAddingEffect = new ConfigurationAddingEffectManager(this);
  public readonly configurationDeleteEffect = new ConfigurationDeleteEffectManager(this);
  public readonly configurationTypeTransferEffect = new ConfigurationTypeTransferEffectManager(this);
  public readonly storage = new EditorStorage(this);
  public readonly configuration = new ConfigurationManager(this);
  public store = createStore();
  public componentDiscovery;
  public constructor(packages: Array<IComponentPackage>) {
    this.componentDiscovery = new ComponentDiscoveryProvider(packages);
  }

}