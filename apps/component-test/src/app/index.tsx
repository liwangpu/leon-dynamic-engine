import styles from './index.module.scss';
import { memo, useMemo } from 'react';
import SimpleNavsPage, { INavItem } from './components/SimpleNavsPage';
import { ComponentPackageContext } from './contexts';
import { IComponentPackage } from '@tiangong/core';
import { ComponentPackage as PrimaryComponentMarket } from '@tiangong/primary-component-package';
import { DataStoreCollocationContext, DataStoreModel, IDataStoreCollocation } from '@tiangong/renderer';
import { connectReduxDevtools } from 'mst-middlewares';

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

  const dataStoreCollocation = useMemo(() => {
    const collocation: IDataStoreCollocation = {
      hosting(store: DataStoreModel) {
        connectReduxDevtools(require("remotedev"), store);
      }
    };
    return collocation;
  }, []);

  return (
    <div className={styles['tutorial-app']}>
      <DataStoreCollocationContext.Provider value={dataStoreCollocation}>
        <ComponentPackageContext.Provider value={packages}>
          <SimpleNavsPage title='组件测试' routes={routes} />
        </ComponentPackageContext.Provider>
      </DataStoreCollocationContext.Provider>
    </div>
  );
});

export default App;