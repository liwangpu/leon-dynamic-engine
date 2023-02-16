import { ISetterPanelContext } from '@lowcode-engine/editor';
import { GenerateShortId } from '@lowcode-engine/core';
import { ISetter, ISetterGroup, ISetterMetadata, SetterType } from './i-setter';
import * as _ from 'lodash';

export const MetadataRegedit = (() => {
  const regedit = new Map<string, ISetterMetadata>();

  const getRegeditKey = (context: ISetterPanelContext) => {
    let key = `type:${context.type}`;
    if (context.parentType) {
      key += `/parentType:${context.parentType}`;
    }
    if (context.slot) {
      key += `/slot:${context.slot}`;
    }
    return key;
  };

  const recursiveSetter = (item: ISetterGroup | ISetter) => {
    if (item.setter === SetterType.setterGroup) {
      item.key=GenerateShortId('SETTER_RGROUP', 6);
      if(item.children){
        for (const cit of item.children) {
          recursiveSetter(cit);
        }
      }
    }else{
      item.key=GenerateShortId('SETTER', 6);
    }
  };

  const generateKeyForSetter = (metadata: ISetterMetadata) => {
    metadata = _.cloneDeep(metadata);
    if (metadata.tabs) {
      for (const tab of metadata.tabs) {
        tab.key = GenerateShortId('TAB', 6);
        if (tab.children) {
          for (const item of tab.children) {
            recursiveSetter(item);
          }
        }
      }
    }
    return metadata;
  };

  return {
    register(context: ISetterPanelContext, metadata: ISetterMetadata) {
      const key = getRegeditKey(context);
      regedit.set(key, generateKeyForSetter(metadata));

    },
    getMetadata(context: ISetterPanelContext) {
      const key = getRegeditKey(context);
      return regedit.get(key);
    }
  };
})();
