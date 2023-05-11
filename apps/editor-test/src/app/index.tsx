import styles from './index.module.less';
import { Outlet } from "react-router-dom";
import { memo } from 'react';
import { ComponentPackageContext, SchemaDataProcessorContext } from './contexts';
import { IComponentPackage, IStoreMonitor, SchemaDataProcessor, StoreMonitorContext } from '@lowcode-engine/core';
import { ComponentPackage as PrimaryComponentPackage } from '@lowcode-engine/primary-component-package';
import { ComponentPackage as VideoPlayerComponentPackage } from './video-player';
import { connectReduxDevtools } from 'mst-middlewares';
import { STORE_NAME as RENDERER_STORE_NAME } from '@lowcode-engine/renderer';
import { STORE_NAME as EDITOR_STORE_NAME } from '@lowcode-engine/editor';

const packages: Array<IComponentPackage> = [
  PrimaryComponentPackage.instance,
  VideoPlayerComponentPackage.instance
  // componentPackageRemoteLoader(() => import('primary-component-package/componentPackage') as any)
];

// const MONITOR_STORE = RENDERER_STORE_NAME;
const MONITOR_STORE = EDITOR_STORE_NAME;

const dataStoreCollocation: IStoreMonitor = {
  hosting: (name: string, store: any) => {
    // console.log(`hosting:`, name);

    if (name === MONITOR_STORE) {
      connectReduxDevtools(require("remotedev"), store);
    }

  }
};

const schemaDataProcessor = new SchemaDataProcessor(packages);

const App: React.FC = memo(() => {


  return (
    <StoreMonitorContext.Provider value={dataStoreCollocation}>
      <SchemaDataProcessorContext.Provider value={schemaDataProcessor}>
        <ComponentPackageContext.Provider value={packages}>
          <div className={styles['app']}>
            <Outlet />
          </div>
        </ComponentPackageContext.Provider>
      </SchemaDataProcessorContext.Provider>
    </StoreMonitorContext.Provider>
  );
});

export default App;