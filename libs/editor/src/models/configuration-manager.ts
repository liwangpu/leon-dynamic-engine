import { GenerateComponentId, IComponentConfiguration } from '@lowcode-engine/core';
import { ISetterPanelContext } from '../contexts';
import { IEditorContext } from './editor-manager';
import * as _ from 'lodash';

// 组件配置面板数据切片器
interface IConfigurationSelector {
  (editorContext: IEditorContext, conf: IComponentConfiguration): IComponentConfiguration;
}

/**
 * 组件配置管理器
 */
export interface IConfigurationManager {
  /**
   * 设置组件配置面板数据切片器
   * @param filter 组件所处的上下文过滤条件
   * @param selector 数据切片器
   */
  registerConfigurationSelector(filter: ISetterPanelContext, selector: IConfigurationSelector): void;
  /**
   * 获取组件配置面板数据切片器
   * @param filter 组件所处的上下文过滤条件
   */
  getConfigurationSelector(filter: ISetterPanelContext): IConfigurationSelector;
  /**
   * 获取组件类型
   * @param type 组件类型
   */
  getComponentTypeCount(type: string): number;
  /**
   * 获取组件配置
   * @param id 组件id
   * @param withSlot 是否附带插槽子组件配置(如果带,只附带子一级)
   */
  getComponent(id: string, withSlot?: boolean): IComponentConfiguration;
  /**
   * 获取组件的类型
   * @param id 组件id
   */
  getComponentType(id: string): string;
  /**
   * 获取组件的父组件id
   * @param id 父组件id
   */
  getParentId(id: string): string;
  /**
   * 判断是否含有组件
   * @param id 组件id
   */
  hasComponent(id: string): boolean;
  /**
   * 添加组件
   * @param conf 组件配置 
   * @param parentId 父组件id
   * @param index 下标
   * @param slotProperty 组件在父组件里面的插槽属性 
   */
  addComponent(conf: IComponentConfiguration, parentId: string, index: number, slotProperty: string): Promise<void>;
  /**
   * 删除组件
   * @param id 组件id
   */
  deleteComponent(id: string): Promise<boolean>;
  /**
   * 更新单个组件
   * @param conf 组件配置 
   */
  updateComponent(conf: Partial<IComponentConfiguration>): Promise<void>;
  /**
   * 更新多个组件
   * @param confs 组件配置 
   */
  updateComponents(confs: Array<Partial<IComponentConfiguration>>): Promise<void>;
  /**
   * 激活组件
   * @param id 组件id
   */
  activeComponent(id: string): void;
}

export class ConfigurationManager implements IConfigurationManager {

  private readonly selectors = new Map<string, IConfigurationSelector>();

  public constructor(protected context: IEditorContext) { }

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

  public hasComponent(id: string): boolean {
    if (!id) { return false; }
    return this.context.store.treeStore.trees.has(id);
  }

  public getComponentTypeCount(type: string): number {
    return this.context.store.treeStore.selectComponentTypeCount(type);
  }

  public getComponentType(id: string): string {
    return this.context.store.treeStore.selectComponentType(id);
  }

  public getParentId(id: string): string {
    return this.context.store.treeStore.selectComponentParentId(id);
  }

  public async addComponent(conf: IComponentConfiguration, parentId: string, index: number, slotProperty: string): Promise<void> {
    if (!conf.id) {
      conf.id = GenerateComponentId(conf.type);
    }

    if (this.hasComponent(conf.id)) {
      return;
    }
    // 新增的组件可能会有插槽组件数据,这里需要解析一下插槽配置
    const addComponent = async (subConf: IComponentConfiguration, parentId: string, index: number, slotProperty: string) => {
      const slotProperties = this.context.slot.getSlotProperties(subConf.type);
      const parentConf = this.context.store.configurationStore.selectComponentConfigurationWithoutChildren(parentId);
      subConf = await this.context.configurationAddingHandler.handle({
        current: subConf,
        parent: parentConf,
        slot: slotProperty,
      });
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

    const deleteResponse = await this.context.configurationDeleteHandler.handleDelete({
      current,
      parent,
      slot: currentTree.slotProperty
    });

    const canDelete = deleteResponse ? deleteResponse.canDelete : true;
    const deleteMessage = deleteResponse ? deleteResponse.message : '因为不满足删除条件,所以删除失败!';
    if (!canDelete) {
      if (deleteMessage) {
        console.log(`删除提示:`, deleteMessage);
      }
      return false;
    }
    this.context.store.deleteComponent(id);
    // this.context.event.emit(EventTopicEnum.componentActiving, this.context.store.interactionStore.activeComponentId);

    // 删除后父节点需要重新获取更新后的子节点信息
    parent = this.getComponent(currentTree.parentId, true);

    this.context.configurationDeleteHandler.handleAfterDelete({
      current,
      parent,
      slot: currentTree.slotProperty
    });

    return true;
  }

  public async updateComponent(conf: Partial<IComponentConfiguration>): Promise<void> {
    if (!conf) { return; }
    const store = this.context.store;
    const type = this.getComponentType(conf.id);
    // 检查组件类型是否变更
    if (conf.type && conf.type !== type) {
      const previousConf = this.getComponent(conf.id, true);
      const transferConf = await this.context.configurationTypeTransferHandler.handle({
        previous: previousConf,
        current: conf as any,
      });
      // 一般来讲,转化后的conf是不可能为空的,如果有,说明转化处理器肯定有问题,那么这次转化没有意义
      // 转化组件的id是不能变的
      if (transferConf) {
        conf = transferConf;
        store.clearSlotComponents(conf.id);
        store.treeStore.changeComponentType(conf.id, conf.type);
        store.configurationStore.resetConfiguration(conf.id);
      }
    }

    const maintainSlot = async (subConf: Partial<IComponentConfiguration>) => {
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
          await maintainSlot(c);
        }
        this.context.store.treeStore.updateSlot(subConf.id, slotProperty, childrenIds);
        delete subConf[slotProperty];
      }
      this.context.store.configurationStore.updateComponentConfiguration(subConf);
    };

    await maintainSlot({ type, ...conf });
  }

  public async updateComponents(confs: Array<Partial<IComponentConfiguration>>): Promise<void> {
    if (confs && confs.length) {
      for (const c of confs) {
        await this.updateComponent(c);
      }
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