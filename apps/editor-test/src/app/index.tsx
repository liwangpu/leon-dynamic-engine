import styles from './index.module.less';
import { Outlet } from "react-router-dom";
import { memo } from 'react';
import { ComponentPackageContext, StoreContext } from './contexts';
import { createStore } from './stores';
import { IComponentPackage } from '@tiangong/core';
import { ComponentPackage as PrimaryComponentMarket } from '@tiangong/primary-component-package';

// import 'tiangong-ui/lib/style/index.less';

const packages: Array<IComponentPackage> = [
  // VideoComponentMarket.getInstance(),
  PrimaryComponentMarket.getInstance(),
  // componentPackageRemoteLoader(() => import('primary-component-package/componentPackage') as any)
];

const App: React.FC = memo(() => {
  return (
      <ComponentPackageContext.Provider value={packages}>
        <div className={styles['app']}>
          <Outlet />
        </div>
      </ComponentPackageContext.Provider>
  );
});

export default App;