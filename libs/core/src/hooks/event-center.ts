import { useContext, useEffect } from 'react';
import { EventCenterEngineContext } from '../contexts';
import { IComponentConfiguration, IEvent } from '../models';

export function useEventCenter(conf: IComponentConfiguration) {
  const engine = useContext(EventCenterEngineContext);

  useEffect(() => {
    return () => {
      if (!engine) { return; }
      engine.deRegisterAction(conf);
    };
  }, []);

  return {
    dispatch: async (component: IComponentConfiguration, event: IEvent, data?: any) => {
      if (!engine) {
        console.warn(`事件引擎没有实施,事件将不会生效`);
        return;
      }
      return engine.dispatch(component, event, data);
    },
    registerAction: (action: string, executor: (data?: any) => Promise<any>) => {
      if (!engine) { return; }
      engine.registerAction(conf, action, executor);
    },
  };
}