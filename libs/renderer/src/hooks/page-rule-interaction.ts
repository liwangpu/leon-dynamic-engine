import { IPageRule } from '@tiangong/core';
import { useContext } from 'react';
import * as _ from 'lodash';
import { DataStoreModel } from '../store';

export function usePageRuleInteraction(store:DataStoreModel,rules?: Array<IPageRule>) {
  if (!rules || !rules.length) { return; }



}