import { DynamicForm, SetterType } from '../../models';
import StringSetter from './StringSetter';
import NumberSetter from './NumberSetter';
import BooleanSetter from './BooleanSetter';
import CheckBoxSetter from './CheckBoxSetter';
import RadioSetter from './RadioSetter';
import { PrimaryHeadingSetter, SecondaryHeadingSetter } from './HeadingSetter';
import { ListSetter } from './ListSetter';
import GroupSetter from './GroupSetter';

export function initSetter(): void {
  DynamicForm.instance.registerSetter(SetterType.listSetter, ListSetter);
  DynamicForm.instance.registerSetter(SetterType.groupSetter, GroupSetter);
  DynamicForm.instance.registerSetter(SetterType.primaryHeadingSetter, PrimaryHeadingSetter);
  DynamicForm.instance.registerSetter(SetterType.secondaryHeadingSetter, SecondaryHeadingSetter);
  DynamicForm.instance.registerSetter(SetterType.stringSetter, StringSetter);
  DynamicForm.instance.registerSetter(SetterType.numberSetter, NumberSetter);
  DynamicForm.instance.registerSetter(SetterType.booleanSetter, BooleanSetter);
  DynamicForm.instance.registerSetter(SetterType.checkBoxSetter, CheckBoxSetter);
  DynamicForm.instance.registerSetter(SetterType.radioSetter, RadioSetter);
}