import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { SkeletonAreaEnum } from '../../enums';
import { useAreaSkeleton } from '../../hooks';

const Banner: React.FC = observer(() => {

  const { areaSkeleton: LeftAreaSkeleton } = useAreaSkeleton(SkeletonAreaEnum.topLeftArea);
  const { areaSkeleton: MiddleAreaSkeleton } = useAreaSkeleton(SkeletonAreaEnum.topMiddleArea);
  const { areaSkeleton: RightAreaSkeleton } = useAreaSkeleton(SkeletonAreaEnum.topRightArea);

  return (
    <div className={styles['banner']}>
      <div className={styles['banner__left']}>
        {LeftAreaSkeleton}
      </div>
      <div className={styles['banner__middle']}>
        {MiddleAreaSkeleton}
      </div>
      <div className={styles['banner__right']}>
        {RightAreaSkeleton}
      </div>
    </div>
  );
});

Banner.displayName = 'Banner';

export default Banner;