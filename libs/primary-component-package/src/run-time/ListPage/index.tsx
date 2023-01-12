import styles from './index.module.less';
import { IDynamicComponentProps, useDynamicComponentEngine } from '@tiangong/core';
import { memo, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigationBack } from '../../hooks';
import { IPageComponentConfiguration } from '../../models';
import ThreeColumnStretch from '../ThreeColumnStretch';

const ListPage: React.FC<IDynamicComponentProps<IPageComponentConfiguration>> = memo(observer(props => {

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
    if (!conf.children || !conf.children.length) { return null; }
    return conf.children?.map(c => (<DynamicComponent key={c.id} configuration={c} />))
  }, [conf.children]);

  return (
    <div className={styles['page']} data-dynamic-component={conf.id}>
      <div className={styles['page__header']}>
        {NavigationBack}
        <p className={styles['page__title']}>{conf.title}</p>
        <div className={styles['page-operators']} data-dynamic-component-container='operators' data-dynamic-container-direction='horizontal' data-dynamic-container-owner={conf.id} >
          {OperatorComponents}
        </div>
      </div>
      <div className={styles['page__content']} data-dynamic-component-container='children' data-dynamic-container-owner={conf.id} >
        <div className={styles['wrapper']}>
          {ChildrenComponents}
        </div>
      </div>
    </div>
  );
}));

ListPage.displayName = 'ListPage';

export default ListPage;
