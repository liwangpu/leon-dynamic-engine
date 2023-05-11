import type { ISetterBase } from "@lowcode-engine/dynamic-form";
import { PrimarySetterType } from '../enums';

export interface ITabSelectSetter extends ISetterBase {
  setter: PrimarySetterType.tabSelect;
}