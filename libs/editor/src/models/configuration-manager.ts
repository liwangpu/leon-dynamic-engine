import { GenerateComponentId, IComponentConfiguration } from '@lowcode-engine/core';
import { ISetterPanelContext } from '../contexts';
import { IEditorContext } from './editor-manager';
import * as _ from 'lodash';
import { EventTopicEnum } from '../enums';

interface IConfigurationSelector {
  (editorContext: IEditorContext, conf: IComponentConfiguration): IComponentConfiguration;
}

export interface IConfigurationManager {
  registerConfigurationSelector(filter: ISetterPanelContext, selector: IConfigurationSelector): void;
  getConfigurationSelector(filter: ISetterPanelContext): IConfigurationSelector;
  addComponent(conf: IComponentConfiguration, parentId: string, index: number, slotProperty: string): void;
  deleteComponent(id: string): void;
  updateComponent(conf: Partial<IComponentConfiguration>): void;
  updateComponents(confs: Array<Partial<IComponentConfiguration>>): void;
}

export class ConfigurationManager implements IConfigurationManager {

  private readonly selectors = new Map<string, IConfigurationSelector>();
  public constructor(private context: IEditorContext) { }

  public getConfigurationSelector(filter: ISetterPanelContext): IConfigurationSelector {
    // 先找最精确匹配的,如果找不到然后逐次降低优先级
    let key = ConfigurationManager.generateFilterKey(filter);
    if (!key) {
      key = ConfigurationManager.generateFilterKey({ type: filter.type, parentType: filter.parentType });
    }
    if (!key) {
      key = ConfigurationManager.generateFilterKey({ type: filter.type, slot: filter.slot });
    }
    if (!key) {
      key = ConfigurationManager.generateFilterKey({ type: filter.type })
    }
    if (!key) {
      return;
    }

    return this.selectors.get(key);
  }

  public registerConfigurationSelector(filter: ISetterPanelContext, selector: IConfigurationSelector): void {
    const key = ConfigurationManager.generateFilterKey(filter);
    this.selectors.set(key, selector);
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
    this.context.event.emit(EventTopicEnum.componentActiving, this.context.store.interactionStore.activeComponentId);
  }

  public updateComponent(conf: Partial<IComponentConfiguration>): void {
    // console.log(`conf:`, conf);

    const maintainSlot = (subConf: Partial<IComponentConfiguration>) => {
      console.log(`subConf:`, _.cloneDeep(subConf));
      // 查看组件插槽设定,把插槽部分配置维护到组件树
      // 如果插槽部分数据不规范,不给予维护
      if (!subConf || !subConf.id || !subConf.type) {
        console.warn(`插槽属性不规范,不会进行插槽数据同步:`, subConf);
        return;
      }
      const slotProperties = this.context.slot.getSlotProperties(subConf.type);
      for (const slotProperty of slotProperties) {
        if (_.isNil(subConf[slotProperty])) { break; }

        // 把插槽部分移除,单独维护
        const singleton = this.context.slot.checkSlotSingleton(subConf.type, slotProperty);
        const slotValue: Array<Partial<IComponentConfiguration>> = singleton ? [subConf[slotProperty]] : subConf[slotProperty];
        // id维护到父组件插槽上
        const childrenIds = slotValue.map(x => x.id);
        const originChildrenIds = this.context.store.treeStore.selectSlotChildrenIds(subConf.id, slotProperty);
        for (const c of slotValue) {
          // 先看看没有没有新增的组件,因为新增的组件需要维护到组件树上
          if (!originChildrenIds || !originChildrenIds.some(oid => oid === c.id)) {
            this.context.store.treeStore.addComponentTree(c as any, subConf.id, slotProperty);
          }
          maintainSlot(c);
        }
        this.context.store.treeStore.updateSlot(subConf.id, slotProperty, childrenIds);
        delete subConf[slotProperty];
      }
      this.context.store.configurationStore.updateComponentConfiguration(subConf);
    };


    maintainSlot(conf);


  }

  public updateComponents(confs: Array<Partial<IComponentConfiguration>>): void {
    if (confs && confs.length) {
      confs.forEach(c => {
        this.updateComponent(c);
      });
    }
  }

  private static generateFilterKey(filter: ISetterPanelContext) {
    let key = `type:${filter.type}`;
    if (filter.parentType) {
      key += `/parentType:${filter.parentType}`;
    }
    if (filter.slot) {
      key += `/slot:${filter.slot}`;
    }
    return key;
  };

}