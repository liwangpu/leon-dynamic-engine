import styles from './index.module.scss';
import { memo, useMemo } from 'react';
import SimpleNavsPage, { INavItem } from './components/SimpleNavsPage';
import { ComponentPackageContext } from './contexts';
import { IComponentPackage } from '@tiangong/core';
import { ComponentPackage as PrimaryComponentMarket } from '@tiangong/primary-component-package';

const packages: Array<IComponentPackage> = [
  PrimaryComponentMarket.getInstance(),
];

const App: React.FC = memo(() => {

  const routes = useMemo<Array<INavItem>>(() => ([
    {
      title: '完整页面',
      path: '/app/full-page',
    },
    {
      title: '表格测试',
      path: '/app/table-test',
    }
  ]), []);

  return (
    <div className={styles['tutorial-app']}>
      <ComponentPackageContext.Provider value={packages}>
        <SimpleNavsPage title='组件测试' routes={routes} />
      </ComponentPackageContext.Provider>
    </div>
  );
});

export default App;