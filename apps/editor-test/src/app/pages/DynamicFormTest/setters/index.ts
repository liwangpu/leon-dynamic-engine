import { DynamicForm } from '@lowcode-engine/component-configuration-shared';
import CustomSetter1 from './CustomSetter';

export * from './ListItem';

export default function registerSetter() {
  DynamicForm.instance.registerSetter('custom-1', CustomSetter1);
}