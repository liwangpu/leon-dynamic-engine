import styles from './index.module.scss';
import { memo, useMemo } from 'react';
import { ComponentPackageContext } from './contexts';
import { IComponentPackage, IStoreMonitor, StoreMonitorContext } from '@lowcode-engine/core';
import { SimpleNavsPage, INavItem } from '@app-test/spare-parts';
import { ComponentPackage as PrimaryComponentMarket } from '@lowcode-engine/primary-component-package';
import { STORE_NAME as RENDERER_STORE_NAME } from '@lowcode-engine/renderer';
import { connectReduxDevtools } from 'mst-middlewares';

const packages: Array<IComponentPackage> = [
  PrimaryComponentMarket.instance,
];

const MONITOR_STORE = RENDERER_STORE_NAME;

const dataStoreCollocation: IStoreMonitor = {
  hosting: (name: string, store: any) => {

    if (name === MONITOR_STORE) {
      connectReduxDevtools(require("remotedev"), store);
    }

  }
};

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

  // const dataStoreCollocation = useMemo(() => {
  //   const collocation: IDataStoreCollocation = {
  //     hosting(store: DataStoreModel) {
  //       connectReduxDevtools(require("remotedev"), store);
  //     }
  //   };
  //   return collocation;
  // }, []);

  return (
    <div className={styles['tutorial-app']}>
      <StoreMonitorContext.Provider value={dataStoreCollocation}>
        <ComponentPackageContext.Provider value={packages}>
          <SimpleNavsPage title='组件测试' routes={routes} />
        </ComponentPackageContext.Provider>
      </StoreMonitorContext.Provider>
    </div>
  );
});

export default App;