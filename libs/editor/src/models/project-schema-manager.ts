import { GenerateComponentId, IComponentConfiguration, IProjectSchema } from '@lowcode-engine/core';
import { generateDesignState, nestComponentTree } from '../store';
import { IEditorContext } from './editor-manager';
import { getSnapshot, IDisposer, onAction } from 'mobx-state-tree';
import * as _ from 'lodash';
import { EventTopicEnum } from '../enums';

const listenPaths = ['/configurationStore', '/treeStore'];
const listenActions = ['setState'];

export interface IProjectManager {
  import(schema: IProjectSchema): void;
  export(): IProjectSchema;
  addComponent(conf: IComponentConfiguration, parentId: string, index: number, slotProperty: string): void;
  deleteComponent(id: string): void;
  updateComponent(conf: Partial<IComponentConfiguration>): void;
  updateComponents(confs: Array<Partial<IComponentConfiguration>>): void;
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

  public addComponent(conf: IComponentConfiguration, parentId: string, index: number, slotProperty: string): void {
    if (!conf.id) {
      conf.id = GenerateComponentId(conf.type);
    }
    // 新增的组件可能会有插槽组件数据,这里需要解析一下插槽配置
    const addComponent = async (subConf: IComponentConfiguration, parentId: string, index: number, slotProperty: string) => {
      const slotProperties = this.context.slot.getSlotProperties(subConf.type);
      const parentConf = this.context.store.configurationStore.selectComponentConfigurationWithoutChildren(parentId);
      subConf = await this.context.configurationAddingHandler.handle(subConf, parentConf, slotProperty);
      let pureConf: IComponentConfiguration = _.omit(subConf, slotProperties) as any;
      this.context.store.addComponent(pureConf, parentId, index, slotProperty);
      for (let sp of slotProperties) {
        const singleton = this.context.slot.checkSlotSingleton(subConf.type, sp);
        let components: Array<IComponentConfiguration> = [];
        if (subConf[sp]) {
          if (singleton) {
            components.push(subConf[sp]);
          } else {
            components = subConf[sp];
          }
        }
        if (!components.length) { continue; }
        components.forEach((sc, idx) => {
          addComponent(sc, subConf.id, idx, sp);
        });
      }
    };
    addComponent(conf, parentId, index, slotProperty);
  }

  public deleteComponent(id: string): void {
    this.context.store.deleteComponent(id);
  }

  public updateComponent(conf: Partial<IComponentConfiguration>): void {
    this.context.store.configurationStore.updateComponentConfigurations([conf]);
  }

  public updateComponents(confs: Array<Partial<IComponentConfiguration>>): void {
    this.context.store.configurationStore.updateComponentConfigurations(confs);
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