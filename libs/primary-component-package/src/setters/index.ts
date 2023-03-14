import { SetterRegistry } from '@lowcode-engine/dynamic-form';
import { PrimarySetterType } from '../enums';
import ComponentTypeSetter from './ComponentTypeSetter';
import GridColumnSpanSetter from './GridColumnSpanSetter';

export function RegisterSetter(): void {
  SetterRegistry.instance.registerSetter(PrimarySetterType.componentType, ComponentTypeSetter);
  SetterRegistry.instance.registerSetter(PrimarySetterType.gridColumnSpan, GridColumnSpanSetter);
}