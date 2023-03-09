import { SetterRegistry } from '@lowcode-engine/dynamic-form';
import CustomSetter1 from './CustomSetter';
import { CustomListItem, CustomListFooter } from './ListItem';

export * from './ListItem';

export default function registerSetter() {
  SetterRegistry.instance.registerSetter('custom-1', CustomSetter1);
  SetterRegistry.instance.registerSetter('cus-item', CustomListItem);
  SetterRegistry.instance.registerSetter('cus-footer', CustomListFooter);
}