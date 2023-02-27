import { IComponentPackage } from '@lowcode-engine/core';
import { FormListFieldData } from 'antd';
import React from 'react';

export interface IFormListContext {

}

export const FormListContext = React.createContext<IFormListContext>(null);

export interface IFormListItemContext extends FormListFieldData {
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

export const FormListItemContext = React.createContext<IFormListItemContext>(null);