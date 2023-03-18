import { SetterType } from '../../enums';
import { SetterRegistry } from '../../models';
import StringSetter from './StringSetter';
import TabsSetter from './TabsSetter';
import NumberSetter from './NumberSetter';
import BooleanSetter from './BooleanSetter';
import CheckBoxSetter from './CheckBoxSetter';
import RadioSetter from './RadioSetter';
import SelectSetter from './SelectSetter';
import GroupSetter from './GroupSetter';
import ListSetter from './ListSetter';
import { PrimaryHeadingSetter, SecondaryHeadingSetter } from './HeadingSetter';
import GridColumnSpanSetter from './GridColumnSpanSetter';
import GridLayoutSetter from './GridLayoutSetter';

export function initSetter(): void {
  SetterRegistry.instance.registerSetter(SetterType.tabs, TabsSetter);
  SetterRegistry.instance.registerSetter(SetterType.list, ListSetter);
  SetterRegistry.instance.registerSetter(SetterType.group, GroupSetter);
  SetterRegistry.instance.registerSetter(SetterType.primaryHeading, PrimaryHeadingSetter);
  SetterRegistry.instance.registerSetter(SetterType.secondaryHeading, SecondaryHeadingSetter);
  SetterRegistry.instance.registerSetter(SetterType.string, StringSetter);
  SetterRegistry.instance.registerSetter(SetterType.number, NumberSetter);
  SetterRegistry.instance.registerSetter(SetterType.boolean, BooleanSetter);
  SetterRegistry.instance.registerSetter(SetterType.checkBox, CheckBoxSetter);
  SetterRegistry.instance.registerSetter(SetterType.radio, RadioSetter);
  SetterRegistry.instance.registerSetter(SetterType.select, SelectSetter);
  SetterRegistry.instance.registerSetter(SetterType.gridColumnSpan, GridColumnSpanSetter);
  SetterRegistry.instance.registerSetter(SetterType.gridLayout, GridLayoutSetter);
}