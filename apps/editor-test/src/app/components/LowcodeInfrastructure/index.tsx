import React, { memo } from 'react';
import { IComponentPackage, IStoreMonitor, StoreMonitorContext } from '@lowcode-engine/core';
import { STORE_NAME as RENDERER_STORE_NAME } from '@lowcode-engine/renderer';
import { STORE_NAME as EDITOR_STORE_NAME } from '@lowcode-engine/editor';
import { connectReduxDevtools } from 'mst-middlewares';
import { ComponentPackage as PrimaryComponentPackage } from '@lowcode-engine/primary-component-package';
import { ComponentPackage as VideoPlayerComponentPackage } from '../../packages/video-player';
import { ComponentPackage as ImageViewerComponentPackage } from '../../packages/image-viewer';

// TODO: 临时测试使用,后面移除
// const MONITOR_STORE = RENDERER_STORE_NAME;
const MONITOR_STORE = EDITOR_STORE_NAME;

const dataStoreMonitor: IStoreMonitor = {
  hosting: (name: string, store: any) => {
    if (name === MONITOR_STORE) {
      connectReduxDevtools(require("remotedev"), store);
    }
  }
};

const packages: Array<IComponentPackage> = [
  PrimaryComponentPackage.instance,
  VideoPlayerComponentPackage.instance,
  ImageViewerComponentPackage.instance,
];

interface ILowcodeInfrastructureContext {
  packages: Array<IComponentPackage>;
}

const LowcodeInfrastructureCtx: ILowcodeInfrastructureContext = {
  packages,
};

const LowcodeInfrastructureComponent: React.FC<{ children?: (context: ILowcodeInfrastructureContext) => React.ReactNode }> = memo(props => {

  return (
    <StoreMonitorContext.Provider value={dataStoreMonitor}>
      {props.children && props.children(LowcodeInfrastructureCtx)}
    </StoreMonitorContext.Provider>
  );
});

LowcodeInfrastructureComponent.displayName = 'LowcodeInfrastructureComponent';

export default LowcodeInfrastructureComponent;