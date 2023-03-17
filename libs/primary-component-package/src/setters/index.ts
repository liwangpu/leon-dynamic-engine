import { SetterRegistry } from '@lowcode-engine/dynamic-form';
import { PrimarySetterType } from '../enums';
import ComponentTypeSetter from './ComponentTypeSetter';
import { ButtonActionItem, ButtonActionListFooter } from './ButtonActionSetter';
import { PageChildrenItem, PageChildrenFooter } from './TestSetter';

export function RegisterSetter(): void {
  SetterRegistry.instance.registerSetter(PrimarySetterType.componentType, ComponentTypeSetter);
  SetterRegistry.instance.registerSetter(PrimarySetterType.buttonActionItem, ButtonActionItem);
  SetterRegistry.instance.registerSetter(PrimarySetterType.buttonActionListFooter, ButtonActionListFooter);
  // 测试的setter
  SetterRegistry.instance.registerSetter('page-children-item', PageChildrenItem);
  SetterRegistry.instance.registerSetter('page-children-footer', PageChildrenFooter);
}
