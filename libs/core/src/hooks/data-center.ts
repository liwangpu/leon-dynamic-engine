import { useContext } from 'react';
import { DataCenterEngineContext } from '../contexts';
import { IComponentConfiguration } from '../models';

export function useDataCenter(conf: IComponentConfiguration) {
  const engine = useContext(DataCenterEngineContext);

  return {
    _getState(componentId: string, property: string) {
      if (!engine) { return; }
      return engine.getState(componentId, property);
    },
    setData(field: string, value: any) {
      if (!engine) { return; }
      engine.setData(field, value);
    },
    setState(property: string, data?: any) {
      if (!engine) { return; }
      engine.setState(conf.id, property, data);
    },
    getState(property: string) {
      if (!engine) { return; }
      return engine.getState(conf.id, property);
    },
    getVisible() {
      return engine.getVisible(conf.id);
    }
  };
}



export function useStateCenter<T = any>(componentId: string, property: string): [T, (s?: T) => void] {
  const engine = useContext(DataCenterEngineContext);
  const state: T = engine ? engine.getState(componentId, property) : null;

  const setState = (s: T) => {
    if (!engine) { return; }

    engine.setState(componentId, property, s);
  };

  return [
    state,
    setState,
  ];
}