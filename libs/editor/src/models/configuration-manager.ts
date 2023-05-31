import { GenerateComponentId, IBaseEffectPlacement, IComponentConfiguration } from '@lowcode-engine/core';
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
   * 获取父组件配置
   * @param id 组件id
   * @param withSlot 是否附带插槽子组件配置(如果带,只附带子一级)
   */
  getParentComponent(id: string, withSlot?: boolean): IComponentConfiguration;
  /**
   * 获取组件的层级路径
   * @param id 组件id
   */
  getComponentPath(id: string): Array<IComponentConfiguration>;
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
  addComponent(conf: Partial<IComponentConfiguration>, parentId: string, index: number, slotProperty: string): Promise<boolean>;
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
   * 移动组件
   * @param id 组件id
   * @param parentId 父组件id
   * @param slotProperty 插槽属性
   * @param index 位置下标
   */
  moveComponent(id: string, parentId: string, slotProperty: string, index: number): Promise<boolean>;
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

    for (const f of matchedFilters) {
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
    if (!this.context.store.structure.trees.has(id)) {
      return null;
    }
    const conf = withSlot ? this.context.store.structure.selectComponentConfigurationWithChildren(id) : this.context.store.structure.selectComponentConfigurationWithoutChildren(id, true);

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

  public getParentComponent(id: string, withSlot?: boolean): IComponentConfiguration {
    const parentId = this.getParentId(id);
    if (!parentId) { return null; }

    return this.getComponent(parentId, withSlot);
  }

  public getComponentPath(id: string): Array<IComponentConfiguration> {
    const pathInfo = this.context.store.structure.selectHierarchyList(id);
    return pathInfo.map(p => this.getComponent(p.id, true));
  }

  public hasComponent(id: string): boolean {
    if (!id) { return false; }
    return this.context.store.structure.trees.has(id);
  }

  public getComponentTypeCount(type: string): number {
    return this.context.store.structure.selectComponentTypeCount(type);
  }

  public getComponentType(id: string): string {
    return this.context.store.structure.selectComponentType(id);
  }

  public getParentId(id: string): string {
    return this.context.store.structure.selectComponentParentId(id);
  }

  public async addComponent(conf: Partial<IComponentConfiguration>, parentId: string, index: number, slotProperty: string): Promise<boolean> {
    if (!conf.id) {
      conf.id = GenerateComponentId(conf.type);
    }

    if (this.hasComponent(conf.id)) {
      return false;
    }
    const store = this.context.store;
    // 新增的组件可能会有插槽组件数据,这里需要解析一下插槽配置
    const _addComponent = async (subConf: Partial<IComponentConfiguration>, parentId: string, index: number, slotProperty: string) => {
      const slotProperties = this.context.slot.getSlotProperties(subConf.type);
      const parentConf = store.structure.selectComponentConfigurationWithoutChildren(parentId);
      const componentPath = this.getComponentPath(parentId);
      const placement = this.calculateComponentPlacement(subConf.id, parentId, slotProperty, index);
      subConf = await this.context.configurationAddingEffect.handleAdd({
        current: subConf as any,
        parent: parentConf,
        slot: slotProperty,
        path: componentPath,
        ...placement,
      });
      if (!subConf) {
        return false;
      }

      const pureConf: IComponentConfiguration = _.omit(subConf, slotProperties) as any;
      store.structure.addComponent(pureConf, parentId, index, slotProperty);
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
          await _addComponent(components[idx], subConf.id, idx, sp);
        }
      }
      await this.context.configurationAddingEffect.handleAfterAdd({
        current: subConf as any,
        parent: parentConf,
        slot: slotProperty,
        path: componentPath,
        ...placement,
      });

      return true;
    };
    return await _addComponent(conf, parentId, index, slotProperty);
  }

  public async deleteComponent(id: string): Promise<boolean> {
    const canDelete = await this.canDeleteComponent(id);
    if (!canDelete) {
      return false;
    }
    const current = this.getComponent(id, true);
    const currentTree = this.context.store.structure.trees.get(id);
    if (!currentTree) { return false; }

    let parent: IComponentConfiguration = this.getComponent(currentTree.parentId, true);
    const placement = this.calculateComponentPlacement(id);
    this.context.store.deleteComponent(id);

    // 删除后父节点需要重新获取更新后的子节点信息
    parent = this.getComponent(currentTree.parentId, true);

    await this.context.configurationDeleteEffect.handleAfterDelete({
      current,
      parent,
      slot: currentTree.slotProperty,
      ...placement
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
      conf = await this.context.configurationTypeTransferEffect.handle({
        previous: previousConf,
        current: conf as any,
      });

      /**
       * 一般来讲,转化后的conf是不可能为空的,如果有,说明转化处理器肯定有问题,那么这次转化没有意义
       * 转化组件的id是不能变的
       */
      if (!conf) { return; }

      const { parentId, slotProperty, index } = store.structure.selectComponentTreeInfo(conf.id);
      const parentConf = this.getComponent(parentId, true);
      const componentPath = this.getComponentPath(conf.id);
      const placement = this.calculateComponentPlacement(conf.id, parentId, slotProperty, index);
      // 对于类型转化,其实也是另一种形式的添加组件,所以也需要调用adding effect
      conf = await this.context.configurationAddingEffect.handleAdd({
        current: conf as any,
        parent: parentConf,
        slot: slotProperty,
        path: componentPath,
        ...placement,
      });

      if (!conf) {
        return;
      } else {
        store.structure.clearSlotComponents(conf.id);
        store.structure.changeComponentType(conf.id, conf.type);
        store.structure.resetConfiguration(conf.id);
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
        const originChildrenIds = store.structure.selectSlotChildrenIds(subConf.id, slotProperty);
        // 先检查是否有已经删除的组件
        const deletedIds = _.difference(originChildrenIds, childrenIds);
        if (deletedIds.length) {
          deletedIds.forEach(oid => {
            store.structure.deleteComponent(oid);
          });
        }

        for (const c of slotValue) {
          // 先看看没有没有新增的组件,因为新增的组件需要维护到组件树上
          if (!originChildrenIds || !originChildrenIds.some(oid => oid === c.id)) {
            store.structure.addComponentTree(c as any, subConf.id, slotProperty);
          }
          await maintainSlot(c);
        }
        store.structure.updateSlot(subConf.id, slotProperty, childrenIds);
        delete subConf[slotProperty];
      }
      store.structure.updateComponentConfiguration(subConf);
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
    this.context.store.interaction.activeComponent(id);
  }

  public async moveComponent(id: string, parentId: string, slotProperty: string, index: number): Promise<boolean> {
    const canMove = await this.canMoveComponent(id, parentId, slotProperty, index);
    if (!canMove) { return false; }

    const store = this.context.store;
    store.structure.moveComponent(id, parentId, index, slotProperty);
    return true;
  }

  private async canMoveComponent(id: string, parentId: string, slotProperty: string, index: number): Promise<boolean> {
    const store = this.context.store;
    // 先判定是否是不是原地移动
    const originTreeInfo = store.structure.selectComponentTreeInfo(id);
    if (parentId === originTreeInfo.parentId && slotProperty === originTreeInfo.slotProperty && index === originTreeInfo.index) {
      return false;
    }

    /**
     * 移动组件在另一种形式上,对于插槽来说,是新增,所以需要调用add判断一下能否移动
     */

    return this.mockValidatePlacementChange(id, parentId, slotProperty, index);
  }

  private async canDeleteComponent(id: string): Promise<boolean> {
    const treeInfo = this.context.store.structure.selectComponentTreeInfo(id);
    if (!treeInfo) {
      return false;
    }
    return this.mockValidatePlacementChange(id, treeInfo.parentId, treeInfo.slotProperty, -1);
  }

  private async mockValidatePlacementChange(id: string, parentId: string, slotProperty: string, index: number): Promise<boolean> {
    const store = this.context.store;
    const parentConf = store.structure.selectComponentConfigurationWithoutChildren(parentId);
    const componentPath = this.getComponentPath(parentId);

    // 对于拖动,仅仅判断当前是不够的,因为如果是原来节点移动位置,同层级可能会触发不满足的条件,所以也需要把同层级的hanlder重新再走一遍
    // 这里需要模拟如果当前节点移动导致同层级节点下标改变的情况
    const sameLevelChildIds = store.structure.selectSlotChildrenIds(parentId, slotProperty);
    // console.log(`origin:`, sameLevelChildIds);
    if (sameLevelChildIds.some(sid => sid === id)) {
      const fromIndex = sameLevelChildIds.indexOf(id);
      // 如果index是-1是想删除
      if (index > -1) {
        sameLevelChildIds.splice(index, 0, sameLevelChildIds.splice(fromIndex, 1)[0]);
      } else {
        sameLevelChildIds.splice(fromIndex, 1);
      }
    } else {
      sameLevelChildIds.splice(index, 0, id);
    }
    // console.log(`after:`, sameLevelChildIds);
    for (let idx = 0; idx < sameLevelChildIds.length; idx++) {
      const sid = sameLevelChildIds[idx];
      const sconf = this.getComponent(sid, false);
      const p = this.calculateComponentPlacement(sid, parentId, slotProperty, idx);
      if (!await this.context.configurationAddingEffect.handleAdd({
        current: sconf,
        parent: parentConf,
        slot: slotProperty,
        path: componentPath,
        ...p,
      })) {
        return false;
      }
    }
    return true;
  }

  private calculateComponentPlacement(id: string, parentId?: string, slotProperty?: string, index?: number): IBaseEffectPlacement {
    /**
     * 调用该方法的主要是拿来判定组件的位置信息
     * 而这个位置可能是既有的位置,也有可能是要放置的位置
     */

    const store = this.context.store;
    // 如果只传递了id,没有传递parentId,slotProperty和index,那么是拿来查看当前的位置信息
    if (_.isNil(parentId) && _.isNil(slotProperty) && _.isNil(index)) {
      return store.structure.selectComponentTreeInfo(id);
    }

    const generatePlacement = (idx: number, count: number) => {
      const even = (idx + 1) % 2 === 0;
      return { index: idx, count, first: idx === 0, last: idx === count - 1, even, odd: !even };
    };

    index = index || 0;
    const count: number = store.structure.selectSlotChildrenCount(parentId, slotProperty);
    // 先查看是不是新增到组件树的节点,如果是,那么查看它要放置的插槽位置
    const created = !store.structure.trees.has(id);
    if (created) {
      // 如果是新增的节点,那么count要在原来数量上+1
      return generatePlacement(index, count + 1);
    }


    const treeInfo = store.structure.selectComponentTreeInfo(id);
    // 如果是已有节点,那么判断它是不是同插槽移动
    if (parentId && treeInfo.parentId === parentId) {
      return generatePlacement(index, count);
    } else {
      return generatePlacement(index, count + 1);
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
  }

}