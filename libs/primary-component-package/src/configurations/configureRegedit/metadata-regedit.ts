import { ISetterPanelContext } from '@lowcode-engine/editor';
import { ISetterMetadataGenerator } from './i-setter';
import * as _ from 'lodash';

export const MetadataRegedit = (() => {
  const regedit = new Map<string, ISetterMetadataGenerator>();

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

  return {
    register(context: ISetterPanelContext, metaGenerator: ISetterMetadataGenerator) {
      const key = getRegeditKey(context);
      regedit.set(key, metaGenerator);
    },
    getMetadata(context: ISetterPanelContext): ISetterMetadataGenerator {
      const key = getRegeditKey(context);
      return regedit.get(key);
    }
  };
})();
