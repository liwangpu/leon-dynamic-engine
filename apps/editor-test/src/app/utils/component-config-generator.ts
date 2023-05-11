import { GenerateComponentCode, GenerateComponentId } from '@lowcode-engine/core';
import { ComponentTypes, IPageComponentConfiguration, ITableComponentConfiguration } from '@lowcode-engine/primary-component-package';

export function generateListPageConfig(): IPageComponentConfiguration {
  return {
    id: GenerateComponentId(ComponentTypes.listPage),
    type: ComponentTypes.listPage,
    code: GenerateComponentCode(ComponentTypes.listPage),
    title: '列表页面',
    width: '100%',
    height: '100%',
    operators: [],
    children: [],
  };
}

export function generateTableConfig(): ITableComponentConfiguration {
  return {
    id: GenerateComponentId(ComponentTypes.table),
    type: ComponentTypes.table,
    code: GenerateComponentCode(ComponentTypes.table),
    title: '列表',
    operators: [],
    columns: [],
  };
}