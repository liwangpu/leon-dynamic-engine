import { useState } from 'react';
import * as _ from 'lodash';

export function useLocalStorage(storageKey: string) {

  const [value, setValue] = useState<any>(localStorage.getItem(storageKey) ? JSON.parse(localStorage.getItem(storageKey)) : undefined);
  return {
    value,
    setValue(val: any) {
      setValue(val);
      if (_.isNil(val)) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(val));
      }
    }
  };
}