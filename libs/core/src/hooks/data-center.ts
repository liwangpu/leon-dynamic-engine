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
