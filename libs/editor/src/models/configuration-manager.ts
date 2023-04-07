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
  getComponent(id: string, withSlot?: boolean): IComponentConfiguration;
  addComponent(conf: IComponentConfiguration, parentId: string, index: number, slotProperty: string): Promise<void>;
  deleteComponent(id: string): Promise<boolean>;
  updateComponent(conf: Partial<IComponentConfiguration>): void;
  updateComponents(confs: Array<Partial<IComponentConfiguration>>): void;
  activeComponent(id: string): void;
}

export class ConfigurationManager implements IConfigurationManager {

  private readonly selectors = new Map<string, IConfigurationSelector>();

  // eslint-disable-next-line no-useless-constructor
  public constructor(private context: IEditorContext) { }


  public getConfigurationSelector(filter: ISetterPanelContext): IConfigurationSelector {
    // 先找最精确匹配的,如果找不到然后逐次降低优先级
    const matchedFilters = [
      filter,
      { type: filter.type, parentType: filter.parentType },
      { type: filter.type, slot: filter.slot },
      { type: filter.type },
    ];

    for (let f of matchedFilters) {
      const key = ConfigurationManager.generateFilterKey(f);
      if (this.selectors.has(key)) {
        return this.selectors.get(key);
      }
    }
  }

  public registerConfigurationSelector(filter: ISetterPanelContext, selector: IConfigurationSelector): void {
    const key = ConfigurationManager.generateFilterKey(filter);
    this.selectors.set(key, selector);
  }

  public getComponent(id: string, withSlot?: boolean): IComponentConfiguration {
    if (!id) { return null; }
    if (!this.context.store.treeStore.trees.has(id)) {
      return null;
    }
    const conf = withSlot ? this.context.store.configurationStore.selectComponentConfigurationWithChildren(id) : this.context.store.configurationStore.selectComponentConfigurationWithoutChildren(id, true);

    // 根据插槽是否是单数还是复数,修改类型
    if (withSlot) {
      const slotProperties = this.context.slot.getSlotProperties(conf.type);
      for (const slotProperty of slotProperties) {
        const values: Array<IComponentConfiguration> = conf[slotProperty];
        if (values && values.length) {
          if (this.context.slot.checkSlotSingleton(conf.type, slotProperty)) {
            conf[slotProperty] = values[0];
          }
        }
      }
    }
    return conf;
  }

  public async addComponent(conf: IComponentConfiguration, parentId: string, index: number, slotProperty: string): Promise<void> {
    if (!conf.id) {
      conf.id = GenerateComponentId(conf.type);
    }
    // 新增的组件可能会有插槽组件数据,这里需要解析一下插槽配置
    const addComponent = async (subConf: IComponentConfiguration, parentId: string, index: number, slotProperty: string) => {
      const slotProperties = this.context.slot.getSlotProperties(subConf.type);
      const parentConf = this.context.store.configurationStore.selectComponentConfigurationWithoutChildren(parentId);
      subConf = await this.context.configurationAddingHandler.handle(subConf, parentConf, slotProperty);
      const pureConf: IComponentConfiguration = _.omit(subConf, slotProperties) as any;
      this.context.store.addComponent(pureConf, parentId, index, slotProperty);
      for (const sp of slotProperties) {
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
        for (let idx = 0; idx < components.length; idx++) {
          await addComponent(components[idx], subConf.id, idx, sp);
        }
      }
    };
    await addComponent(conf, parentId, index, slotProperty);
  }

  public async deleteComponent(id: string): Promise<boolean> {
    const current = this.getComponent(id, true);
    const currentTree = this.context.store.treeStore.trees.get(id);
    if (!currentTree) { return false; }
    let parent: IComponentConfiguration = this.getComponent(currentTree.parentId, true);
    const deleteHandler = this.context.configurationDeleteHandler.getDeleteHandler({
      typeSelector: current.type,
      parentTypeSelector: parent?.type,
      slotSelector: currentTree.slotProperty,
    });

    if (_.isFunction(deleteHandler)) {
      const res = await deleteHandler(current, parent, currentTree.slotProperty);
      const canDelete = res ? res.canDelete : true;
      const msg = res ? res.message : '因为不满足删除条件,所以删除失败!';

      if (!canDelete) {
        if (msg) {
          console.log(`删除提示:`, msg);
        }
        return false;
      }
    }
    this.context.store.deleteComponent(id);
    this.context.event.emit(EventTopicEnum.componentActiving, this.context.store.interactionStore.activeComponentId);

    const afterDeleteHandler = this.context.configurationDeleteHandler.getAfterDeleteHandler({
      typeSelector: current.type,
      parentTypeSelector: parent?.type,
      slotSelector: currentTree.slotProperty,
    });
    // 删除后父节点需要重新获取更新后的子节点信息
    parent = this.getComponent(currentTree.parentId, true)
    if (_.isFunction(afterDeleteHandler)) {
      await afterDeleteHandler(current, parent, currentTree.slotProperty);
    }

    return true;
  }

  public updateComponent(conf: Partial<IComponentConfiguration>): void {
    if (!conf) { return; }
    const maintainSlot = (subConf: Partial<IComponentConfiguration>) => {
      // 查看组件插槽设定,把插槽部分配置维护到组件树
      // 如果插槽部分数据不规范,不给予维护
      if (!subConf || !subConf.type) {
        console.warn(`插槽属性不规范,不会进行插槽数据同步:`, subConf);
        return;
      }
      if (!subConf.id) {
        subConf.id = GenerateComponentId(subConf.type);
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
        // 先检查是否有已经删除的组件
        const deletedIds = _.difference(originChildrenIds, childrenIds);
        if (deletedIds.length) {
          deletedIds.forEach(oid => {
            this.context.store.deleteComponent(oid);
          });
        }

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

  public activeComponent(id: string): void {
    this.context.store.interactionStore.activeComponent(id);
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
  }

}