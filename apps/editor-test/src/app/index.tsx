import styles from './index.module.less';
import { Outlet } from "react-router-dom";
import { memo } from 'react';
import { ComponentPackageContext } from './contexts';
import { IComponentPackage } from '@lowcode-engine/core';
import { DataStoreCollocationContext, EditorStoreModel, IDataStoreCollocation } from '@lowcode-engine/editor';
import { ComponentPackage as PrimaryComponentPackage } from '@lowcode-engine/primary-component-package';
import { ComponentPackage as VideoPlayerComponentPackage } from './video-player'
import { connectReduxDevtools } from 'mst-middlewares';

const packages: Array<IComponentPackage> = [
  PrimaryComponentPackage.instance,
  VideoPlayerComponentPackage.instance
  // componentPackageRemoteLoader(() => import('primary-component-package/componentPackage') as any)
];

const dataStoreCollocation: IDataStoreCollocation = {
  hosting(s: EditorStoreModel) {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    connectReduxDevtools(require("remotedev"), s);
  },
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