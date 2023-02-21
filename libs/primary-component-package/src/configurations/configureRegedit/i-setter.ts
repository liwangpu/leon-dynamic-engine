import { IComponentConfiguration } from '@lowcode-engine/core';
import { IEditorContext } from '@lowcode-engine/editor';
import { Observable } from 'rxjs';

export enum SetterType {
  setterGroup = 'setterGroup',
  stringSetter = 'stringSetter',
  numberSetter = 'numberSetter',
  booleanSetter = 'booleanSetter',
  checkBoxSetter = 'checkBoxSetter',
  gridColumnSpanSetter = 'gridColumnSpanSetter'
}

export interface IBaseSetter {
  setter: any;
  label: string;
  name: string;
  required?: boolean;
  help?: string;
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

export interface IGridColumnSpanSetter extends IBaseSetter {
  setter: SetterType.gridColumnSpanSetter;
}


export type ISetter = IStringSetter | INumberSetter | IGridColumnSpanSetter | ICheckBoxSetter | IBooleanSetter;

export interface ISetterGroup {
  setter: SetterType.setterGroup;
  title: string;
  children?: Array<ISetter>;
  // 开发不需自己设置,表单渲染引擎会自己设置
  key?: string;
}

export interface ISetterTab {
  title: string;
  children?: Array<ISetterGroup | ISetter>;
  // 开发不需自己设置,表单渲染引擎会自己设置
  key?: string;
}

export interface ISetterMetadata {
  tabs: Array<ISetterTab>;
  onLoad?: (config: IComponentConfiguration, valueChange$: Observable<IComponentConfiguration>) => Promise<void>;
  onDestroy?: () => Promise<void>;
  onChange?: (config: IComponentConfiguration) => Promise<IComponentConfiguration>;
}

export interface ISetterMetadataGenerator {
  (editorContext: IEditorContext): Promise<ISetterMetadata>;
}