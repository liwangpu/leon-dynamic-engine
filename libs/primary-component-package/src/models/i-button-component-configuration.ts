import { IComponentConfiguration, IEvent } from '@lowcode-engine/core';
import { ButtonEventType } from '../enums';

export enum ButtonUIType {
  defaultType = 'default',
  primaryType = 'primary',
  textType = 'text',
  link = 'link'
}


export interface IButtonComponentConfiguration extends IComponentConfiguration {
  uiType?: ButtonUIType;
  enableBindTabs?: boolean;
  bindTabs?: Array<any>;
  event: {
    [ButtonEventType.click]: IEvent;
  };
}

export interface IButtonGroupComponentConfiguration extends IComponentConfiguration {
  children?: Array<IButtonComponentConfiguration>;
}
