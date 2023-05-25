import { IComponentDescription, IComponentPackage, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from '@lowcode-engine/core';
import { ComponentTypes } from './enums';
import { DynamicConfigPanelLoader, pascalFormat } from '@lowcode-engine/component-configuration-shared';

export const ComponentDescriptions: IComponentDescription[] = [
  {
    type: ComponentTypes.imageViewer,
    title: '图片查看器',
  }
];


export class ComponentPackage implements IComponentPackage {

  public readonly name = 'ImageViewerComponentPackage';
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

  public queryComponentDescriptions(): Array<IComponentDescription> {
    return ComponentDescriptions;
  }

  /**
   * 加载运行时组件模块
   * @param type - 组件类型
   * @param platform - 平台
   */
  public loadComponentRunTimeModule(type: ComponentTypes): Promise<IRunTimePackageModule> {
    return import(`./components/${pascalFormat(type)}/run-time`);
  }

  /**
   * 加载设计时组件模块
   * @param type - 组件类型
   * @param platform - 平台
   */
  public loadComponentDesignTimeModule(type: ComponentTypes): Promise<IDesignTimePackageModule> {
    return null;
  }

  /**
   * 加载组件属性面板配置
   * @param type - 组件类型
   * @param platform - 平台
   */
  public loadComponentConfigurationModule(type: ComponentTypes): Promise<IConfigurationPackageModule> {
    return import(`./components/${pascalFormat(type)}/configuration`);
  }


}