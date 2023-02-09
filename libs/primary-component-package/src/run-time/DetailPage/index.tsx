import { IDynamicComponentProps, useDynamicComponentEngine } from '@lowcode-engine/core';
import { memo, useMemo } from 'react';
import { IPageComponentConfiguration } from '../../models';
import { observer } from 'mobx-react-lite';
import styles from './index.module.less';
import { useNavigationBack } from '../../hooks';

const DetailPage: React.FC<IDynamicComponentProps<IPageComponentConfiguration>> = memo(observer(props => {

  const conf = props.configuration;
  const dynamicEngine = useDynamicComponentEngine();
  const navigationBack = useNavigationBack();
  const DynamicComponent = dynamicEngine.getDynamicComponentRenderFactory();
  const NavigationBack = navigationBack.getGoBackContent();
  const OperatorComponents = useMemo(() => {
    if (!conf.operators || !conf.operators.length) { return null; }
    return conf.operators.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.operators]);

  const ChildrenComponents = useMemo(() => {
    return conf.children?.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.children]);

  return (
    <div className={styles['page']}>
      <div className={styles['page__header']}>
        {NavigationBack}
        <p className={styles['page__title']}>{conf.title}</p>
        <div className={styles['page-operators']} data-dynamic-component-container='operators' data-dynamic-container-direction='horizontal' data-dynamic-container-owner={conf.id} >
          {OperatorComponents}
        </div>
      </div>
      <div className={styles['page__content']}  >
        <div className={styles['wrapper']} data-dynamic-component-container='children' data-dynamic-container-owner={conf.id}>
          {ChildrenComponents}
        </div>
      </div>
    </div>
  );
}));

DetailPage.displayName = 'DetailPage';

export default DetailPage;
