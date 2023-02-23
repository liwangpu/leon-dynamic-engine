import { IComponentConfiguration } from '@lowcode-engine/core';

export enum ButtonUIType {
  defaultType = 'default',
  primaryType = 'primary',
  textType = 'text',
  link = 'link'
}

export interface IButtonComponentConfiguration extends IComponentConfiguration {
  uiType?: ButtonUIType;
}
