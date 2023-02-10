import { IComponentDiscovery } from '@lowcode-engine/core';
import { EditorStoreModel } from '../store';
import { IDomManager } from './dom-manager';
import { IEventManager } from './event-manager';
import { IProjectManager } from './project-schema-manager';
import { ISkeletonManager } from './skeleton-manager';
import { ISlotManager } from './slot-manager';
import { IConfigurationAddingHandlerManager } from './configuration-handler-manager';

export interface IPlugin {
  init(): Promise<void>;
  destroy?(): Promise<void>;
}

export interface PluginRegisterContext {
  skeleton: ISkeletonManager;
  project: IProjectManager;
  componentDiscovery: IComponentDiscovery;
  store: EditorStoreModel;
  dom: IDomManager;
  event: IEventManager;
  slot: ISlotManager;
  configurationAddingHandler: IConfigurationAddingHandlerManager;
}

export interface IPluginRegister {
  (context: PluginRegisterContext): IPlugin;
}