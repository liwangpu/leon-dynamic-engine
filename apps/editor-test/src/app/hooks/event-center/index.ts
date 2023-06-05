import { IEventCenterEngineContext } from '@lowcode-engine/core';
import { useMemo } from 'react';

export function useEventCenterProvider(): IEventCenterEngineContext {


  const eventCenter = useMemo<IEventCenterEngineContext>(() => {
    return {
      dispatch(event, data) {

        return null;
      },
      registerAction(component, action, executor) {
        console.log(`re:`, component);
      },
      deRegisterAction(component) {

      },
    };
  }, []);

  return eventCenter;
}