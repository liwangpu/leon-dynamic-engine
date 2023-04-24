import { IComponentDescription } from '@lowcode-engine/core';
import { ComponentTypes } from '../enums';

export const ComponentDescriptions: IComponentDescription[] = [
  {
    type: ComponentTypes.listPage,
    title: '列表页面'
  },
  {
    type: ComponentTypes.detailPage,
    title: '详情页面'
  },
  {
    type: ComponentTypes.button,
    title: '按钮'
  },
  {
    type: ComponentTypes.buttonGroup,
    title: '按钮组'
  },
  {
    type: ComponentTypes.block,
    title: '区块'
  },
  {
    type: ComponentTypes.text,
    title: '文本'
  },
  {
    type: ComponentTypes.textarea,
    title: '多行文本'
  },
  {
    type: ComponentTypes.number,
    title: '数字'
  },
  {
    type: ComponentTypes.table,
    title: '表格'
  },
  {
    type: ComponentTypes.tableSerialNumberColumn,
    title: '序号列'
  },
  {
    type: ComponentTypes.tableOperatorColumn,
    title: '操作列'
  },
  {
    type: ComponentTypes.tableSelectionColumn,
    title: '选择列'
  },
  {
    type: ComponentTypes.pagination,
    title: '分页器'
  },
  {
    type: ComponentTypes.tabs,
    title: '多页签'
  },
  {
    type: ComponentTypes.tab,
    title: '页签'
  },
];