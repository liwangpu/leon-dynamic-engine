import { SetterRegistry } from '@lowcode-engine/dynamic-form';
import { PrimarySetterType } from '../enums';
import { ButtonActionListItem, ButtonActionListFooter } from './ButtonActionSetter';
import { PageChildrenItem, PageChildrenFooter } from './TestSetter';
import TabSelect from './TabSelectorSetter';

export function RegisterSetter(): void {
  SetterRegistry.instance.registerSetter(PrimarySetterType.buttonActionItem, ButtonActionListItem);
  SetterRegistry.instance.registerSetter(PrimarySetterType.buttonActionListFooter, ButtonActionListFooter);
  SetterRegistry.instance.registerSetter(PrimarySetterType.tabSelect, TabSelect);
  // 测试的setter
  SetterRegistry.instance.registerSetter('page-children-item', PageChildrenItem);
  SetterRegistry.instance.registerSetter('page-children-footer', PageChildrenFooter);
}
