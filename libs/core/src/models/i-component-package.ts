import { ComponentType } from 'react';
import { IComponentConfiguration } from './i-component-configuration';

export interface IComponentDescription {
  type: string;
  title: string;
  actions?: Array<{ key: string; name: string }>;
  events?: Array<{ key: string; name: string }>;
  [key: string]: any;
}

export interface IDynamicComponentProps<T = IComponentConfiguration> {
  configuration: T;
  disabled?: boolean;
  value?: any;
  onChange?: (val: any) => void;
  className?: string | Array<string> | { [name: string]: boolean };
  style?: { [property: string]: any };
  children?: React.ReactNode | ((conf: IComponentConfiguration) => React.ReactNode);
  options?: { [key: string]: any };
}

export interface IDynamicComponentContainerProps {
  configuration: Partial<IComponentConfiguration>;
  slot: string;
  direction?: 'horizontal' | 'vertical';
  dropOnly?: boolean;
  className?: string | Array<string> | { [name: string]: boolean };
  style?: { [property: string]: any };
  children?: (confs: Array<IComponentConfiguration>) => React.ReactNode;
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
  default: ComponentType<IDynamicComponentProps>;
};

export interface IConfigurationPackageModule {
  default: ComponentType<IComponentConfigurationPanelProps>;
};

export interface IComponentSlotInfo {
  [componentType: string]: ISlotPropertyDefinition;
}

export interface ISlotPropertyMatch {
  accepts?: Array<string>;
  rejects?: Array<string>;
  singleton?: boolean;
}

export interface ISlotPropertyDefinition {
  [slotProperty: string]: ISlotPropertyMatch;
}


export interface IComponentPackage {
  name?: string; // 组件包名称
  queryComponentDescriptions(): Array<IComponentDescription> | Promise<Array<IComponentDescription>>;
  queryComponentSlotInfo?(): IComponentSlotInfo | Promise<IComponentSlotInfo>;
  loadComponentRunTimeModule(type: string, platform?: string): Promise<IRunTimePackageModule>;
  loadComponentDesignTimeModule(type: string, platform?: string): Promise<IDesignTimePackageModule>;
  loadComponentConfigurationModule(type: string, platform?: string): Promise<IConfigurationPackageModule>;
}
