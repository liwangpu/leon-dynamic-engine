import { camelCase, upperFirst } from 'lodash';

export function pascalFormat(name: string): string {
  return upperFirst(camelCase(name));
}