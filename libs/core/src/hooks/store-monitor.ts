import { useContext, useEffect } from 'react';
import { StoreMonitorContext } from '../contexts';

export function useStoreMonitorHosting(name: string, store: any) {

  const storeMonitorContext = useContext(StoreMonitorContext);

  useEffect(() => {
    if (storeMonitorContext) {
      storeMonitorContext.hosting(name, store);
    }
  }, []);
}