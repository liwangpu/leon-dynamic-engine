import { observer } from 'mobx-react-lite';
import { useAreaSkeleton } from '../../hooks';
import { SkeletonAreaEnum } from '../../enums';
import styles from './index.module.less';

export const PagePresentationFooterAreaPanel: React.FC = observer(() => {

  const { areaSkeleton } = useAreaSkeleton(SkeletonAreaEnum.pagePresentationFooterArea);
  return (
    <div className={styles['presentation-footer']}>
      {areaSkeleton}
    </div>

  );
});

PagePresentationFooterAreaPanel.displayName = 'PagePresentationFooterAreaPanel';

