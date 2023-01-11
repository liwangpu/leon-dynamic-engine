import { useContext } from 'react';
import { DataCenterEngineContext } from '../contexts';

export function useDataCenter() {
  const engine = useContext(DataCenterEngineContext);

  return {
    setData: (field: string, value: any) => {
      if (!engine) { return; }
      engine.setData(field, value);
    }
  };
}