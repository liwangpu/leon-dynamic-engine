import { IComponentDescription, IComponentPackage, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from '@tiangong/core';

export enum ComponentTypes {
  listPage = 'list-page',
  detailPage = 'detail-page',
  button = 'button',
  buttonGroup = 'button-group',
  text = 'text',
  block = 'block',
  tabs = 'tabs',
  tab = 'tab',
  table = 'table',
  form = 'form',
  number = 'number'
}

export class ComponentPackage implements IComponentPackage {

  name = 'PrimaryComponentPackage';
  protected static instance: ComponentPackage;
  protected constructor() {
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
        type: ComponentTypes.form,
        title: '表单'
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
      case ComponentTypes.form:
        return import('./run-time/Form');
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
    switch (type) {
      case ComponentTypes.listPage:
        return import('./configurations/ListPage');
      case ComponentTypes.detailPage:
        return import('./configurations/DetailPage');
      case ComponentTypes.button:
        return import('./configurations/Button');
      case ComponentTypes.block:
        return import('./configurations/Block');
      // case ComponentTypes.tabs:
      //   return import('./configurations/Tabs');
      // case ComponentTypes.tab:
      //   return import('./configurations/Tab');
      case ComponentTypes.text:
        return import('./configurations/Text');
      case ComponentTypes.number:
        return import('./configurations/Text');
      case ComponentTypes.table:
        return import('./configurations/Table');
      default:
        return null;
    }
  }

}