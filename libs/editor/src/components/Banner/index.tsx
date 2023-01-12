import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { memo, useContext, useMemo } from 'react';
import { EditorContext } from '../../contexts';
import React from 'react';
import { SkeletonAreaEnum } from '../../enums';

const Banner: React.FC = memo(observer(() => {

  const { skeleton } = useContext(EditorContext);
  const skeletonGroup = skeleton.skeletonGroup[SkeletonAreaEnum.topArea];

  const TopAreaSkeleton = useMemo(() => {
    if (!skeletonGroup?.size) { return null; }
    return [...skeletonGroup.values()].map(n => (
      <React.Fragment key={n}>
        {skeleton.skeletonMap.get(n)?.content}
      </React.Fragment>
    ));
  }, [skeletonGroup]);

  return (
    <div className={styles['banner']}>
      {TopAreaSkeleton}
    </div>
  );
}));

Banner.displayName = 'Banner';

export default Banner;