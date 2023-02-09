import { IProjectSchema } from '@lowcode-engine/core';
import { generateDesignState, nestComponentTree } from '../store';
import { IEditorContext } from './i-editor-context';
import { getSnapshot, IDisposer, onAction } from 'mobx-state-tree';
import { IProjectManager } from './i-project-manager';
import * as _ from 'lodash';

const listenPaths = ['/configurationStore', '/treeStore'];
const listenActions = ['setState'];

export class ProjectSchemaManager implements IProjectManager {

  public constructor(private context: IEditorContext) { }

  public import(schema: IProjectSchema): void {
    const slotPropertyMap = this.context.slot.getAllSlotProperties();
    const state = generateDesignState(schema, slotPropertyMap);
    this.context.store.setState(state);
  }

  public export(): IProjectSchema {
    const slotPropertyMap = this.context.slot.getAllSlotProperties();
    const schema = nestComponentTree(getSnapshot(this.context.store), slotPropertyMap);
    return schema;
  }

  public monitorSchema(onChange: (schema: IProjectSchema) => void): IDisposer {
    if (!_.isFunction(onChange)) { return; }
    const slotPropertyMap = this.context.slot.getAllSlotProperties();
    const schema = nestComponentTree(getSnapshot(this.context.store), slotPropertyMap);
    onChange(schema);
    return onAction(this.context.store, act => {
      // console.log(`path:`, act.path, act.name);
      if (!(listenPaths.some(p => p === act.path) || listenActions.some(n => n === act.name))) { return; }
      const s = nestComponentTree(getSnapshot(this.context.store), slotPropertyMap);
      onChange(s);
    }, true);
  }
}