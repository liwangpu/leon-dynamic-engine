import { useContext } from 'react';
import { EventCenterEngineContext } from '../contexts';
import { IComponentConfiguration, IEvent } from '../models';

export function useEventCenter(conf: IComponentConfiguration) {
  const engine = useContext(EventCenterEngineContext);

  return {
    dispatch: async (event: IEvent, data?: any) => {
      if (!engine) {
        console.warn(`事件引擎没有实施,事件将不会生效`);
        return;
      }
      // console.log(`dispatch:`, event, data);
      return engine.dispatch(event, data);
    },
    registerAction: (action: { type: string, title: string }, executor: (data?: any) => Promise<any>) => {
      if (!engine) {
        return;
      }
      console.log(`registerAction:`, action);
    },
    disconnect: () => {
      if (!engine) {
        return;
      }
      engine.deRegisterAction(conf);
    }
  };
}