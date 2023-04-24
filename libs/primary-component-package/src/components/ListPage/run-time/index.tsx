import styles from './index.module.less';
import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { memo } from 'react';
import { useNavigationBack } from '../../../hooks';
import { IPageComponentConfiguration } from '../../../models';
import { CommonSlot } from '../../../enums';

const Page: React.FC<IDynamicComponentProps<IPageComponentConfiguration>> = memo(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const navigationBack = useNavigationBack();
  const DynamicComponentContainer = dynamicEngine.getDynamicComponentContainerFactory();
  const NavigationBack = navigationBack.getGoBackContent();

  return (
    <div className={styles['page']}>
      <div className={styles['page__header']}>
        {NavigationBack}
        <p className={styles['page__title']}>{conf.title}</p>
        <DynamicComponentContainer
          className={styles['page-operators']}
          configuration={conf}
          slot={CommonSlot.operators}
          direction='horizontal'
        />
      </div>
      <div className={styles['page__content']}>
        <DynamicComponentContainer
          className={styles['page-content-wrapper']}
          configuration={conf}
          slot={CommonSlot.children}
        />
      </div>
    </div>
  );
});

Page.displayName = 'ListPage';

export default Page;
