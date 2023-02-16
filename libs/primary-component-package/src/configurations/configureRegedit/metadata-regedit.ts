import { ISetterPanelContext } from '@lowcode-engine/editor';
import { ISetterMetadata } from './i-setter';

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

  return {
    register(context: ISetterPanelContext, metadata: ISetterMetadata) {
      const key = getRegeditKey(context);
      regedit.set(key, metadata);
    },
    getMetadata(context: ISetterPanelContext) {
      const key = getRegeditKey(context);
      return regedit.get(key);
    }
  };
})();
