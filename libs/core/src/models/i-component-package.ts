import { ComponentType } from 'react';
import { IComponentConfiguration } from './i-component-configuration';

export interface IComponentDescription {
  type: string;
  title: string;
  [key: string]: any;
}

export interface IDynamicComponentProps<T = IComponentConfiguration> {
  configuration: T;
  disabled?: boolean;
  value?: any;
  onChange?: (val: any) => void;
}

export interface IComponentConfigurationPanelProps<T = IComponentConfiguration> {
  value: T;
  onChange(configuration: T): void;
  parentType?: string;
}

export interface IRunTimePackageModule {
  default: ComponentType<IDynamicComponentProps>;
};

export interface IDesignTimePackageModule {
  default: ComponentType<IDynamicComponentProps>
};

export interface IConfigurationPackageModule {
  default: ComponentType<IComponentConfigurationPanelProps>
};

export interface IComponentPackage {
  name?: string; // 组件包名称
  queryComponentDescriptions(): Promise<IComponentDescription[]>;
  getComponentDescription(type: string): Promise<IComponentDescription>;
  loadComponentRunTimeModule(type: string, platform: string): Promise<IRunTimePackageModule>;
  loadComponentDesignTimeModule(type: string, platform: string): Promise<IDesignTimePackageModule>;
  loadComponentConfigurationModule(type: string, platform: string): Promise<IConfigurationPackageModule>;
}
