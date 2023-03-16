import { IProjectSchema } from '@lowcode-engine/core';
import { generateDesignState, nestComponentTree } from '../store';
import { IEditorContext } from './editor-manager';
import { getSnapshot, IDisposer, onAction } from 'mobx-state-tree';
import * as _ from 'lodash';
import { EventTopicEnum } from '../enums';

const listenPaths = ['/configurationStore', '/treeStore'];
const listenActions = ['setState', 'deleteComponent', 'addComponent'];

export interface IProjectManager {
  import(schema: IProjectSchema): void;
  export(): IProjectSchema;
  monitorSchema(onChange: (schema: IProjectSchema) => void): IDisposer;
}

export class ProjectSchemaManager implements IProjectManager {

  public constructor(private context: IEditorContext) { }

  public import(schema: IProjectSchema): void {
    const slotPropertyMap = this.context.slot.getAllSlotProperties();
    const slotSingletonMap = this.context.slot.getAllSlotSingletonMap();
    const state = generateDesignState(schema, slotPropertyMap, slotSingletonMap);
    this.context.store.setState(state);
    this.context.event.emit(EventTopicEnum.importSchema, { pageComponentId: state.interactionStore.pageComponentId });
  }

  public export(): IProjectSchema {
    const slotPropertyMap = this.context.slot.getAllSlotProperties();
    const slotSingletonMap = this.context.slot.getAllSlotSingletonMap();
    const schema = nestComponentTree(getSnapshot(this.context.store), slotPropertyMap, slotSingletonMap);
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