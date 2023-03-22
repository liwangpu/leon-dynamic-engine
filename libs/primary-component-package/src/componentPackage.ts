import { IComponentDescription, IComponentPackage, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from '@lowcode-engine/core';
import { ComponentTypes } from './enums';
import { DynamicConfigPanelLoader, pascalFormat } from '@lowcode-engine/component-configuration-shared';

export const ComponentDescriptions: IComponentDescription[] = [
  {
    type: ComponentTypes.listPage,
    title: '列表页面'
  },
  {
    type: ComponentTypes.detailPage,
    title: '详情页面'
  },
  {
    type: ComponentTypes.button,
    title: '按钮'
  },
  {
    type: ComponentTypes.buttonGroup,
    title: '按钮组'
  },
  {
    type: ComponentTypes.block,
    title: '区块'
  },
  {
    type: ComponentTypes.text,
    title: '文本'
  },
  {
    type: ComponentTypes.number,
    title: '数字'
  },
  {
    type: ComponentTypes.table,
    title: '表格'
  },
  {
    type: ComponentTypes.tableSerialNumberColumn,
    title: '表格序号列'
  },
  {
    type: ComponentTypes.tableOperatorColumn,
    title: '表格操作列'
  },
  {
    type: ComponentTypes.tableSelectionColumn,
    title: '表格选择列'
  },
  {
    type: ComponentTypes.pagination,
    title: '分页器'
  }
];

const noDesignTimeComponents = new Set<ComponentTypes>([ComponentTypes.listPage, ComponentTypes.detailPage, ComponentTypes.block]);

export class ComponentPackage implements IComponentPackage {

  name = 'PrimaryComponentPackage';
  private static _instance: ComponentPackage;
  private constructor() {
    //
  }

  public static get instance(): ComponentPackage {
    if (!this._instance) {
      this._instance = new ComponentPackage();
    }
    return this._instance;
  }

  async queryComponentDescriptions(): Promise<IComponentDescription[]> {
    return ComponentDescriptions;
  }  

  /**
   * 加载运行时组件模块
   * @param type - 组件类型
   * @param platform - 平台
   */
  async loadComponentRunTimeModule(type: ComponentTypes, platform: string): Promise<IRunTimePackageModule> {
    return import(`./components/${pascalFormat(type)}/run-time`);
  }

  /**
   * 加载设计时组件模块
   * @param type - 组件类型
   * @param platform - 平台
   */
  async loadComponentDesignTimeModule(type: ComponentTypes, platform: string): Promise<IDesignTimePackageModule> {
    if (noDesignTimeComponents.has(type)) { return null; }

    return import(`./components/${pascalFormat(type)}/design-time`);
  }

  /**
   * 加载组件属性面板配置
   * @param type - 组件类型
   * @param platform - 平台
   */
  async loadComponentConfigurationModule(type: ComponentTypes, platform: string): Promise<IConfigurationPackageModule> {
    return DynamicConfigPanelLoader(() => import(`./components/${pascalFormat(type)}/configuration`));
  }

}
