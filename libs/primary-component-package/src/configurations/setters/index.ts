
import { DynamicForm } from '@lowcode-engine/component-configuration-shared';
import { PrimarySetterType } from '../../enums';
import ComponentTypeSetter from './ComponentTypeSetter';
import GridColumnSpanSetter from './GridColumnSpanSetter';

export default function RegisterSetter(): void {
  DynamicForm.instance.registerSetter(PrimarySetterType.componentTypeSetter, ComponentTypeSetter);
  DynamicForm.instance.registerSetter(PrimarySetterType.gridColumnSpanSetter, GridColumnSpanSetter);
}