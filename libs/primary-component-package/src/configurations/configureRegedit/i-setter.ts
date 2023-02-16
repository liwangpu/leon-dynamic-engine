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
}

export interface IStringSetter extends IBaseSetter {
  setter: SetterType.stringSetter;
}

export interface INumberSetter extends IBaseSetter {
  setter: SetterType.numberSetter;
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
}

export interface ISetterTab {
  title: string;
  children?: Array<ISetterGroup | ISetter>;
}

export interface ISetterMetadata {
  tabs: Array<ISetterTab>;
}