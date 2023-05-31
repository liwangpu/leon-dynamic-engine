import { IProjectSchema } from '@lowcode-engine/core';
import * as _ from 'lodash';
import { ProjectSchemaManager as RendererProjectSchemaManager } from '@lowcode-engine/renderer';
import { IEditorContext } from './editor-manager';

export class ProjectSchemaManager extends RendererProjectSchemaManager {

  public constructor(protected context: any) {
    super(context);
  }

  public override import(schema: IProjectSchema): void {
    super.import(schema);
    const store = (this.context as IEditorContext).store;
    store.interaction.clearEditings();
    store.interaction.activeComponent(schema.id);
  }

}