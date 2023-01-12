import { IProjectSchema } from '@tiangong/core';
import { generateDesignState, nestComponentTree } from '../store';
import { generateDesignState as generateDesignState1 } from '../store';
import { IEditorContext } from './i-editor-context';
import { getSnapshot } from 'mobx-state-tree';
import { IProjectManager } from './i-project-manager';

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
}