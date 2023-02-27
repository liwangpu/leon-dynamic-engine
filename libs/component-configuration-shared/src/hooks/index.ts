import { useContext } from 'react';
import { FormListItemContext } from '../contexts';
import { ISetter, ISetterGroup } from '../models';

export function useSetterName(conf: ISetter | ISetterGroup): string | [number, string] {
  const itemCtx = useContext(FormListItemContext);
  if (!itemCtx) { return conf.name; }

  return [itemCtx.name, conf.name];
}