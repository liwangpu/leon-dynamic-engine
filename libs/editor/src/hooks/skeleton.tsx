import React from 'react';
import { useContext, useMemo } from 'react';
import { EditorContext } from '../contexts';
import { SkeletonAreaEnum } from '../enums';

export function useAreaSkeleton(area: SkeletonAreaEnum) {
  const { skeleton } = useContext(EditorContext);
  const group = skeleton.skeletonGroup[area];

  const areaSkeleton = useMemo(() => {
    if (!group?.size) { return null; }
    return [...group.values()].map(n => (
      <React.Fragment key={n} >
        {skeleton.skeletonMap.get(n)?.content}
      </React.Fragment>
    ));
  }, [group]);

  return { areaSkeleton };
}