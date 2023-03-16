import { SetterRegistry } from '@lowcode-engine/dynamic-form';
import { PrimarySetterType } from '../enums';
import ComponentTypeSetter from './ComponentTypeSetter';
import { ButtonActionItem, ButtonActionListFooter } from './ButtonActionSetter';

export function RegisterSetter(): void {
  SetterRegistry.instance.registerSetter(PrimarySetterType.componentType, ComponentTypeSetter);
  SetterRegistry.instance.registerSetter(PrimarySetterType.buttonActionItem, ButtonActionItem);
  SetterRegistry.instance.registerSetter(PrimarySetterType.buttonActionListFooter, ButtonActionListFooter);
}
