import { ComponentDiscoveryProvider, IComponentDiscovery, IComponentPackage } from '@lowcode-engine/core';
import { createStore, EditorStoreModel } from '../store';
import { ConfigurationAddingHandlerManager } from './configuration-handler-manager';
import { DomManager, IDomManager } from './dom-manager';
import { EventManager, IEventManager } from './event-manager';
import { IProjectManager, ProjectSchemaManager } from './project-schema-manager';
import { ISkeletonManager, SkeletonManager } from './skeleton-manager';
import { ISlotManager, SlotManager } from './slot-manager';

export interface IEditorContext {
  skeleton: ISkeletonManager;
  project: IProjectManager;
  store: EditorStoreModel;
  componentDiscovery: IComponentDiscovery;
  dom: IDomManager;
  event: IEventManager;
  slot: ISlotManager;
  configurationAddingHandler: ConfigurationAddingHandlerManager;
}

export class EditorContextManager implements IEditorContext {

  public readonly skeleton = new SkeletonManager(this);
  public readonly project = new ProjectSchemaManager(this);
  public readonly dom = new DomManager(this);
  public readonly event = new EventManager(this);
  public readonly slot = new SlotManager(this);
  public readonly configurationAddingHandler = new ConfigurationAddingHandlerManager(this);
  public readonly store = createStore();
  public readonly componentDiscovery;
  public constructor(packages: Array<IComponentPackage>) {
    this.componentDiscovery = new ComponentDiscoveryProvider(packages);
  }
}