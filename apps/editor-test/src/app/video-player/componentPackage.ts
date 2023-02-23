import { IComponentDescription, IComponentPackage, IConfigurationPackageModule, IDesignTimePackageModule, IRunTimePackageModule } from '@lowcode-engine/core';
import { ComponentTypes } from './enums';

export const ComponentDescriptions: IComponentDescription[] = [
  {
    type: ComponentTypes.videoPlayer,
    title: '视频播放器'
  }
];

export class ComponentPackage implements IComponentPackage {

  readonly name = 'VideoPlayerComponentPackage';
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
    switch (type) {
      case ComponentTypes.videoPlayer:
        return import('./run-time/VideoPlayer');
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
      case ComponentTypes.videoPlayer:
        return import('./run-time/VideoPlayer');
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
      case ComponentTypes.videoPlayer:
        return import('./configurations/VideoPlayer');
      default:
        return null;
    }
  }

}