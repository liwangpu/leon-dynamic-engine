import { IComponentConfiguration } from '@lowcode-engine/core';
import { useMemo } from 'react';
import { GRID_SYSTEM_SECTION_TOTAL } from '../consts';

export function useComponentStyle(conf: IComponentConfiguration) {
  const style = useMemo(() => {
    const _style: { [key: string]: any } = {};
    if (conf.width) {
      _style['width'] = conf.width;
    }
    if (conf.height) {
      _style['height'] = conf.height;
    }
    if (conf.gridColumnSpan) {
      let sec = GRID_SYSTEM_SECTION_TOTAL;
      try {
        const fn = new Function(`return ${conf.gridColumnSpan}`);
        sec = fn() * GRID_SYSTEM_SECTION_TOTAL;
      } catch { }
      _style['gridColumnStart'] = `span ${sec}`;
    }
    return _style;
  }, [conf]);

  return style;
}