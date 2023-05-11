import { ComponentTypes } from '@lowcode-engine/primary-component-package';
import { ComponentTypes as VideoPlayerComponentTypes } from '../video-player';

/**
 * 这里的分组是业务上对各个基础组件进行划分,方便统一的管理
 */

/**
 * 表单基础组件
 */
export const FormInputGroupTypes: Array<ComponentTypes> = [
  ComponentTypes.text,
  ComponentTypes.textarea,
  ComponentTypes.number
];

/**
 * 按钮组件
 */
export const buttonGroupTypes: Array<ComponentTypes> = [
  ComponentTypes.button,
  ComponentTypes.buttonGroup
];

/**
 * 内嵌的组件,又或者说无法独立存在的组件
 */
export const selfSlotGroupTypes: Array<ComponentTypes> = [
  ComponentTypes.tab
];

/**
 * 当页面设计器中新增以下组件,会在名称后面添加序号
 */
export const ComponentIndexTitleIncludeGroupTypes = new Set<string>([
  ComponentTypes.block,
  ComponentTypes.table,
  ComponentTypes.button,
  ComponentTypes.tabs,
  ComponentTypes.buttonGroup,
]);