import { IComponentDescription, IComponentPackage, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from '@lowcode-engine/core';
import { ComponentTypes } from './enums';
import { pascalFormat } from '@lowcode-engine/component-configuration-shared';

export const ComponentDescriptions: IComponentDescription[] = [
  {
    type: ComponentTypes.videoPlayer,
    title: '视频播放器'
  }
];

export class ComponentPackage implements IComponentPackage {

  readonly name = 'VideoPlayerComponentPackage';
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
    return import(`./components/${pascalFormat(type)}/RunTime`);
  }

  /**
   * 加载设计时组件模块
   * @param type - 组件类型
   * @param platform - 平台
   */
  async loadComponentDesignTimeModule(type: ComponentTypes, platform: string): Promise<IDesignTimePackageModule> {
    return null;
  }

  /**
   * 加载组件属性面板配置
   * @param type - 组件类型
   * @param platform - 平台
   */
  async loadComponentConfigurationModule(type: ComponentTypes, platform: string): Promise<IConfigurationPackageModule> {
    // // 自己开发配置面板
    return import(`./components/${pascalFormat(type)}/Configuration`);

    // // 使用动态表单配置面板
    // await import('./configurations/metadata-register');
    // return DynamicForm.instance.loadForm();

    return null;
  }

}