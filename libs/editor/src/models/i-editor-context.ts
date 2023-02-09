import { IComponentDiscovery } from '@lowcode-engine/core';
import { EditorStoreModel } from '../store';
import { IDomManager } from './i-dom-manager';
import { IEventManager } from './i-event-manager';
import { IProjectManager } from './i-project-manager';
import { ISkeletonManager } from './i-skeleton-manager';
import { ISlotManager } from './i-slot-manager';

export interface IEditorContext {
  skeleton: ISkeletonManager;
  project: IProjectManager;
  store: EditorStoreModel;
  componentDiscovery: IComponentDiscovery;
  dom: IDomManager;
  event: IEventManager;
  slot: ISlotManager;
}