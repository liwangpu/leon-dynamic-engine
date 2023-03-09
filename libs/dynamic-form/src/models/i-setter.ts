import { SetterType } from '../enums';

interface ISetterBase {
  key: string;
  label?: string;
  name?: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
}


export interface ITabsSetter extends ISetterBase {
  setter: SetterType.tabs;
  children: Array<{
    key: string;
    title: string;
    children?: Array<ISetter>;
  }>;
}

export interface IGroupSetter extends ISetterBase {
  setter: SetterType.group;
  name: string;
  children?: Array<ISetter>;
}

export interface IListSetter extends ISetterBase {
  setter: SetterType.list;
  listItem?: React.FC<any>;
  sortable?: boolean;
  dragHandle?: string;
  listItemKeyField?: string;
  listFooter?: React.FC<any>;
}


export interface IPrimaryHeadingSetter extends ISetterBase {
  setter: SetterType.primaryHeading;
  children?: Array<ISetter>;
}

export interface ISecondaryHeadingSetter extends ISetterBase {
  setter: SetterType.secondaryHeading;
  children?: Array<ISetter>;
}

export interface IStringSetter extends ISetterBase {
  setter: SetterType.string;
  minLeng?: number;
}

export interface INumberSetter extends ISetterBase {
  setter: SetterType.number;
  min?: number;
  max?: number;
  step?: number;
}

export interface IBooleanSetter extends ISetterBase {
  setter: SetterType.boolean;
}

export interface ICheckBoxSetter extends ISetterBase {
  setter: SetterType.checkBox;
  data?: Array<{ value: string; label: string }>;
}

export interface IRadioSetter extends ISetterBase {
  setter: SetterType.radio;
  data?: Array<{ value: string; label: string }>;
}


export type ISetter = ITabsSetter | IListSetter | IGroupSetter | IPrimaryHeadingSetter | ISecondaryHeadingSetter | IStringSetter | INumberSetter | IBooleanSetter | ICheckBoxSetter | IRadioSetter;