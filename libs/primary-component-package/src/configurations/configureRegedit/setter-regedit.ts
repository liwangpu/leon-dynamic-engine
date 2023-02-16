import { SetterType } from './i-setter';

export const SetterRegedit = (() => {
  const regedit = new Map<string, React.FC<any>>();

  return {
    register(type: SetterType, component: React.FC<any>) {
      regedit.set(type, component);
    },
    getSetter(type: SetterType) {
      return regedit.get(type);
    }
  };
})();
