import styles from './index.module.less';
import { Outlet } from "react-router-dom";
import { memo } from 'react';
import { ComponentPackageContext } from './contexts';
import { IComponentPackage } from '@lowcode-engine/core';
import { ComponentPackage as PrimaryComponentMarket } from '@lowcode-engine/primary-component-package';
import { DataStoreCollocationContext, EditorStoreModel, IDataStoreCollocation } from '@lowcode-engine/editor';
import { connectReduxDevtools } from 'mst-middlewares';

const packages: Array<IComponentPackage> = [
  PrimaryComponentMarket.getInstance(),
  // componentPackageRemoteLoader(() => import('primary-component-package/componentPackage') as any)
];

const dataStoreCollocation: IDataStoreCollocation = {
  hosting(store: EditorStoreModel) {
    connectReduxDevtools(require("remotedev"), store);
  }
};

const App: React.FC = memo(() => {
  return (
    <DataStoreCollocationContext.Provider value={dataStoreCollocation}>
      <ComponentPackageContext.Provider value={packages}>
        <div className={styles['app']}>
          <Outlet />
        </div>
      </ComponentPackageContext.Provider>
    </DataStoreCollocationContext.Provider>
  );
});

export default App;