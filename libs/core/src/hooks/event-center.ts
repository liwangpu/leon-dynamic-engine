import { useContext } from 'react';
import { EventCenterEngineContext } from '../contexts';
import { IEvent } from '../models';

export function useEventCenter(events: { [eventType: string]: IEvent }) {
  const engine = useContext(EventCenterEngineContext);
  return {
    dispatch: async (eventType: string, data?: any) => {
      if (!engine) {
        console.warn(`事件引擎没有实施,事件将不会生效`);
        return;
      }

      if (!eventType) {
        console.error(`事件类型没有定义,无法触发`);
        return;
      }
      const evt = events[eventType];
      console.log(`dispatch:`, eventType, data, evt);

      return engine.dispatch(evt, data);
    }
  };
}