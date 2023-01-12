import { IComponentDiscovery } from '@tiangong/core';
import { IDomManager } from './i-dom-manager';
import { IEventManager } from './i-event-manager';
import { IProjectManager } from './i-project-manager';
import { ISkeletonManager } from './i-skeleton-manager';
import { ISlotManager } from './i-slot-manager';

export interface IPlugin {
  init(): Promise<void>;
  destroy?(): Promise<void>;
}

export interface PluginRegisterContext {
  skeleton: ISkeletonManager;
  project: IProjectManager;
  componentDiscovery: IComponentDiscovery;
  dom: IDomManager;
  event: IEventManager;
  slot: ISlotManager;
}

export interface IPluginRegister {
  (context: PluginRegisterContext): IPlugin;
}