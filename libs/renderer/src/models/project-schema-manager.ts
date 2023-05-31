import { IProjectSchema } from '@lowcode-engine/core';
import { getSnapshot, IDisposer, onAction } from 'mobx-state-tree';
import * as _ from 'lodash';
import { IRendererContext } from './renderer-manager';
import { generateDesignState, nestComponentTree } from '../store';

const listenPaths = ['/configurationStore', '/treeStore'];
const listenActions = ['setState', 'deleteComponent', 'addComponent'];

export interface IProjectManager {
  import(schema: IProjectSchema): void;
  export(): IProjectSchema;
}

export class ProjectSchemaManager implements IProjectManager {

  public constructor(protected context: IRendererContext) { }

  public import(schema: IProjectSchema): void {
    const slotPropertyMap = this.context.slot.getAllSlotProperties();
    const slotSingletonMap = this.context.slot.getAllSlotSingletonMap();
    const state = generateDesignState(schema, slotPropertyMap, slotSingletonMap);
    this.context.store.structure.setState(state);
  }

  public export(): IProjectSchema {
    const slotPropertyMap = this.context.slot.getAllSlotProperties();
    const slotSingletonMap = this.context.slot.getAllSlotSingletonMap();
    const schema = nestComponentTree(getSnapshot(this.context.store.structure), slotPropertyMap, slotSingletonMap);
    return schema;
  }

}