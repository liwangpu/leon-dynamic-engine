import { useContext } from 'react';
import { FormNamePathContext, SettterContext } from '../contexts';

export function useSetterName(): string | Array<number | string> {
  const setterCtx = useContext(SettterContext);
  const namePathCtx = useContext(FormNamePathContext);
  if (!namePathCtx) { return setterCtx.config.name; }
  const path = [...namePathCtx];
  if (setterCtx.config.name) {
    path.push(setterCtx.config.name);
  }
  return path;
}