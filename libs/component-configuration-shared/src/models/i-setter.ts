import { ISetterBase } from '@lowcode-engine/dynamic-form';
import { SharedSetterType } from '../enums';

export interface IComponentSetter extends ISetterBase {
  setter: SharedSetterType.component;
  componentFilter?: Array<string>;
}

export interface IComponentActionSetter extends ISetterBase {
  setter: SharedSetterType.componentAction;
  componentFilter: string;
}