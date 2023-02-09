import { IComponentConfiguration } from '@lowcode-engine/core';

export interface ISlotPropertyMatch {
  accepts?: Array<string>;
  rejects?: Array<string>;
}

export interface ISlotPropertyDefinition {
  [slotProperty: string]: ISlotPropertyMatch;
}

export interface ISlotManager {
  getSlotProperties(componentType: string): Array<string>;
  getAllSlotProperties(): { [componentType: string]: Array<string> };
  getMatchedSlotProperties(componentType: string): Array<string>;
  verifyAdding(componentType: string, conf: IComponentConfiguration): Promise<IComponentConfiguration>;
  registerMap(map: { [componentType: string]: ISlotPropertyDefinition }): void;
  registerAddingVerification(componentType: string, verifiedFn: (conf: IComponentConfiguration) => Promise<IComponentConfiguration>): void;
}