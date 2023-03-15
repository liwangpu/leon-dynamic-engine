import { SetterRegistry } from '@lowcode-engine/dynamic-form';
import { PrimarySetterType } from '../enums';
import ComponentTypeSetter from './ComponentTypeSetter';

export function RegisterSetter(): void {
  SetterRegistry.instance.registerSetter(PrimarySetterType.componentType, ComponentTypeSetter);
}

export { PrimarySetterType };