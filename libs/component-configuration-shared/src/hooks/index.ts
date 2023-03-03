import { useContext } from 'react';
import { FormListItemContext, FormNamePathContext, SettterContext } from '../contexts';
import { ISetter, ISetterGroup } from '../models';

export function useSetterName(): string | Array<number | string> {
  const setterCtx = useContext(SettterContext);
  const namePathCtx = useContext(FormNamePathContext);
  if (!namePathCtx) { return setterCtx.config.name; }
  return [...namePathCtx, setterCtx.config.name];
}