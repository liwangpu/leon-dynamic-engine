import { SetterRegistry } from '@lowcode-engine/dynamic-form';
import { SharedSetterType } from '../../enums';
import ComponentTypeSetter from './ComponentTypeSetter';
import ComponentSetter from './ComponentSetter';
import ComponentActionSetter from './ComponentActionSetter';

export function RegisterSetter(): void {
  SetterRegistry.instance.registerSetter(SharedSetterType.component, ComponentSetter);
  SetterRegistry.instance.registerSetter(SharedSetterType.componentType, ComponentTypeSetter);
  SetterRegistry.instance.registerSetter(SharedSetterType.componentAction, ComponentActionSetter);
}
