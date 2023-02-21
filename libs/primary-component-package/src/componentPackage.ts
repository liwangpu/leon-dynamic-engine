import { IComponentDescription, IComponentPackage, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from '@lowcode-engine/core';
import { ComponentTypes } from './enums';

export class ComponentPackage implements IComponentPackage {

  name = 'PrimaryComponentPackage';
  private static instance: ComponentPackage;
  private constructor() {
    //
  }

  static getInstance(): ComponentPackage {
    if (!this.instance) {
      this.instance = new ComponentPackage();
    }
    return this.instance;
  }

  async queryComponentDescriptions(): Promise<IComponentDescription[]> {
    return [
      {
        type: ComponentTypes.listPage,
        title: '页面'
      },
      {
        type: ComponentTypes.detailPage,
        title: '页面'
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
        type: ComponentTypes.pagination,
        title: '分页器'
      }
    ];
  }

  async getComponentDescription(type: string): Promise<IComponentDescription> {
    const des = await this.queryComponentDescriptions();
    return des.find(c => c.type === type);
  }

  /**
   * 加载运行时组件模块
   * @param type - 组件类型
   * @param platform - 平台
   */
  async loadComponentRunTimeModule(type: ComponentTypes, platform: string): Promise<IRunTimePackageModule> {
    switch (type) {
      case ComponentTypes.listPage:
        return import('./run-time/ListPage');
      case ComponentTypes.detailPage:
        return import('./run-time/DetailPage');
      case ComponentTypes.button:
        return import('./run-time/Button');
      case ComponentTypes.block:
        return import('./run-time/Block');
      case ComponentTypes.tabs:
        return import('./run-time/Tabs');
      case ComponentTypes.tab:
        return import('./run-time/Tab');
      case ComponentTypes.text:
        return import('./run-time/Text');
      case ComponentTypes.number:
        return import('./run-time/Number');
      case ComponentTypes.table:
        return import('./run-time/Table');
      default:
        return null;
    }
  }

  /**
   * 加载设计时组件模块
   * @param type - 组件类型
   * @param platform - 平台
   */
  async loadComponentDesignTimeModule(type: ComponentTypes, platform: string): Promise<IDesignTimePackageModule> {
    switch (type) {
      case ComponentTypes.button:
        return import('./design-time/Button');
      case ComponentTypes.buttonGroup:
        return import('./design-time/ButtonGroup');
      case ComponentTypes.text:
        return import('./design-time/Text');
      case ComponentTypes.number:
        return import('./design-time/Number');
      case ComponentTypes.table:
        return import('./design-time/Table');
      case ComponentTypes.pagination:
        return import('./design-time/Pagination');
      case ComponentTypes.tableOperatorColumn:
        return import('./design-time/TableOperatorColumn');
      default:
        return null;
    }
  }

  /**
   * 加载组件属性面板配置
   * @param type - 组件类型
   * @param platform - 平台
   */
  async loadComponentConfigurationModule(type: ComponentTypes, platform: string): Promise<IConfigurationPackageModule> {
    return import('./configurations/ConfigurationPanel');
  }

}