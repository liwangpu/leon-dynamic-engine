import type { IComponentPackage, IPluginRegister } from '@lowcode-engine/core';
import type { IRendererContext } from '@lowcode-engine/renderer';
import { RendererContextManager } from '@lowcode-engine/renderer';
import type { EditorStoreModel } from '../store';
import { createStore } from '../store';
import { ComponentFactoryManager } from './component-factory-manager';
import type { IConfigurationAddingEffectManager, IConfigurationDeleteEffectManager, IConfigurationTypeTransferEffectManager, IConfigurationMoveEffectManager } from './configuration-effect-manager';
import { ConfigurationAddingEffectManager, ConfigurationTypeTransferEffectManager, ConfigurationDeleteEffectManager, ConfigurationMoveEffectManager } from './configuration-effect-manager';
import type { IConfigurationManager } from './configuration-manager';
import { ConfigurationManager } from './configuration-manager';
import type { IDomManager } from './dom-manager';
import { DomManager } from './dom-manager';
import type { IEditorStorage } from './editor-storage';
import { EditorStorage } from './editor-storage';
import type { IEventManager } from './event-manager';
import { EventManager } from './event-manager';
import { ProjectSchemaManager } from './project-schema-manager';
import type { ISkeletonManager } from './skeleton-manager';
import { SkeletonManager } from './skeleton-manager';

type IRendererContextType = Omit<IRendererContext, "store">;

export interface IEditorContext extends IRendererContextType {
  /**
   * 扩展面板管理器
   */
  skeleton: ISkeletonManager;
  /**
   * 事件中心管理器
   */
  event: IEventManager;
  /**
   * 组件配置管理器
   */
  configuration: IConfigurationManager;
  configurationAddingEffect: IConfigurationAddingEffectManager;
  configurationDeleteEffect: IConfigurationDeleteEffectManager;
  configurationMoveEffect: IConfigurationMoveEffectManager;
  configurationTypeTransferEffect: IConfigurationTypeTransferEffectManager;
  // 组件dom管理器
  dom: IDomManager;
  store: EditorStoreModel;
  storage: IEditorStorage;
}

export type EditorPluginRegister = IPluginRegister<IEditorContext>;

export class EditorContextManager extends RendererContextManager implements IEditorContext {

  public readonly skeleton = new SkeletonManager(this);

  public readonly dom = new DomManager(this);

  public readonly event = new EventManager(this);

  public readonly project = new ProjectSchemaManager(this);

  public readonly componentFactory = new ComponentFactoryManager(this);

  public readonly configurationAddingEffect = new ConfigurationAddingEffectManager(this);

  public readonly configurationDeleteEffect = new ConfigurationDeleteEffectManager(this);

  public readonly configurationMoveEffect = new ConfigurationMoveEffectManager(this);

  public readonly configurationTypeTransferEffect = new ConfigurationTypeTransferEffectManager(this);

  public readonly storage = new EditorStorage(this);

  public readonly configuration = new ConfigurationManager(this);

  public readonly store: any = createStore();

  public constructor(packages: Array<IComponentPackage>) {
    super(packages);
  }

}