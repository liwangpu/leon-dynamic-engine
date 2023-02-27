import { IComponentConfiguration } from '@lowcode-engine/core';
import { IEditorContext } from '@lowcode-engine/editor';
import { Observable } from 'rxjs';

export enum SetterType {
  // 单个类型
  stringSetter = 'stringSetter',
  numberSetter = 'numberSetter',
  booleanSetter = 'booleanSetter',
  radioSetter = 'radioSetter',
  checkBoxSetter = 'checkBoxSetter',
  gridColumnSpanSetter = 'gridColumnSpanSetter',
  // group类型
  primaryHeadingSetter = 'primaryHeadingSetter',
  secondaryHeadingSetter = 'secondaryHeadingSetter',
  listSetter = 'listSetter',
  listItemSetter = 'listItemSetter',
  // componentTypeSetter = 'componentTypeSetter'
}


export interface IBaseSetter {
  setter: any;
  label: string;
  name: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  // 开发不需自己设置,表单渲染引擎会自己设置
  key?: string;
}

export interface IStringSetter extends IBaseSetter {
  setter: SetterType.stringSetter;
}

export interface INumberSetter extends IBaseSetter {
  setter: SetterType.numberSetter;
  min?: number;
  max?: number;
  step?: number;
}

export interface IBooleanSetter extends IBaseSetter {
  setter: SetterType.booleanSetter;
}

export interface ICheckBoxSetter extends IBaseSetter {
  setter: SetterType.checkBoxSetter;
  data?: Array<{ value: string; label: string }>;
}

export interface IRadioSetter extends IBaseSetter {
  setter: SetterType.radioSetter;
  data?: Array<{ value: string; label: string }>;
}

export interface IGridColumnSpanSetter extends IBaseSetter {
  setter: SetterType.gridColumnSpanSetter;
}

export type ISetter = IStringSetter | INumberSetter | IGridColumnSpanSetter | ICheckBoxSetter | IBooleanSetter | IRadioSetter;


export interface IBaseGroupSetter {
  title: string;
  name?: string;
  children?: Array<ISetter | ISetterGroup | { [key: string]: any }>;
  collapsible?: boolean;
  // 开发不需自己设置,表单渲染引擎会自己设置
  key?: string;
}

export interface IPrimaryHeadingSetter extends IBaseGroupSetter {
  setter: SetterType.primaryHeadingSetter;
}

export interface ISecondaryHeadingSetter extends IBaseGroupSetter {
  setter: SetterType.secondaryHeadingSetter;
}

export interface IListSetter extends IBaseGroupSetter {
  setter: SetterType.listSetter;
  itemSetter?: SetterType | string;
}

export interface IListItemSetter extends IBaseGroupSetter {
  setter: string;
}


export type ISetterGroup = IPrimaryHeadingSetter | ISecondaryHeadingSetter | IListSetter | IListItemSetter;

export function isSetterGroup(setter: ISetterGroup | ISetter): setter is ISetterGroup {
  return 'children' in setter;
}

export interface ISetterTab {
  title: string;
  children?: Array<ISetterGroup | ISetter | { [key: string]: any }>;
  // 开发不需自己设置,表单渲染引擎会自己设置
  key?: string;
}

export interface IFormMetadata {
  tabs: Array<ISetterTab>;
  onLoad?: (config: IComponentConfiguration, valueChange$: Observable<IComponentConfiguration>) => Promise<void>;
  onDestroy?: () => Promise<void>;
  onChange?: (config: IComponentConfiguration) => Promise<IComponentConfiguration>;
}

export interface ISetterMetadataGenerator {
  (editorContext: IEditorContext): Promise<IFormMetadata>;
}
