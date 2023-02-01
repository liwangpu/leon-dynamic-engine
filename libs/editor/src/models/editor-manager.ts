import { ComponentDiscoveryProvider, IComponentPackage } from '@tiangong/core';
import { createStore } from '../store';
import { DomManager } from './dom-manager';
import { EventManager } from './event-manager';
import { IEditorContext } from './i-editor-context';
import { ProjectSchemaManager } from './project-schema-manager';
import { SkeletonManager } from './skeleton-manager';
import { SlotManager } from './slot-manager';

export class EditorContextManager implements IEditorContext {

  public readonly skeleton = new SkeletonManager(this);
  public readonly project = new ProjectSchemaManager(this);
  public readonly dom = new DomManager(this);
  public readonly event = new EventManager(this);
  public readonly slot = new SlotManager(this);
  public readonly store = createStore();
  public readonly componentDiscovery = new ComponentDiscoveryProvider(this.packages);
  public constructor(private packages: Array<IComponentPackage>) { }
}