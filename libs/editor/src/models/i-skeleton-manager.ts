import React from 'react';
import { SkeletonAreaEnum } from '../enums';

export interface ISkeleton {
  title: string;
  area: SkeletonAreaEnum;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface ISkeletonManager {
  skeletonMap: Map<string, ISkeleton>;
  skeletonGroup: { [name in SkeletonAreaEnum]?: Set<string> };
  add(st: ISkeleton): void;
  remove(name: string): void;
}
