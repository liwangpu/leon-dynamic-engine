import * as _ from 'lodash';

/**
 * 获取函数的body字符串(当前暂时不支持箭头函数)
 * @param fn 函数
 * @returns 
 */
export function getFunctionBody(fn: Function): string {
  if (!_.isFunction(fn)) { return null; }
  return fn.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
}