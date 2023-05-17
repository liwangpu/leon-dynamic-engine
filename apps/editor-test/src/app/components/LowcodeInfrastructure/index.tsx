import React, { memo } from 'react';
import { IComponentPackage, IStoreMonitor, StoreMonitorContext } from '@lowcode-engine/core';
import { STORE_NAME as EDITOR_STORE_NAME } from '@lowcode-engine/editor';
import { ExpressionMonitorRegisterContext, IExpressionEffect, IExpressionMonitorRegister, STORE_NAME as RENDERER_STORE_NAME } from '@lowcode-engine/renderer';
import { connectReduxDevtools } from 'mst-middlewares';
import { CommonSlot, ComponentTypes, IButtonComponentConfiguration } from '@lowcode-engine/primary-component-package';
import { ComponentPackage as PrimaryComponentPackage } from '@lowcode-engine/primary-component-package';
import { ComponentPackage as VideoPlayerComponentPackage } from '../../video-player';

// TODO: 临时测试使用,后面移除
const MONITOR_STORE = RENDERER_STORE_NAME;
// const MONITOR_STORE = EDITOR_STORE_NAME;

const dataStoreMonitor: IStoreMonitor = {
  hosting: (name: string, store: any) => {
    if (name === MONITOR_STORE) {
      connectReduxDevtools(require("remotedev"), store);
    }
  }
};

const expressionMonitorRegister: Array<IExpressionMonitorRegister> = [
  (renderer) => [
    { type: ComponentTypes.button, parentType: [ComponentTypes.listPage, ComponentTypes.detailPage], slot: CommonSlot.operators },
    ({ current }: { current: IButtonComponentConfiguration }) => {

      const effects: Array<IExpressionEffect> = [];

      if (current.enableBindTabs && current.bindTabs && current.bindTabs.length) {
        for (const tabId of current.bindTabs) {
          const exp: IExpressionEffect = {
            key: `button_bind_tab_visible@btn:${current.id}@tab:${tabId}`,
            componentId: current.id,
            expression: `
            return this.getState(this.getParent('${tabId}').id,'activeKey')==='${tabId}';
            `,
            target: current.id,
            property: 'visible',
            rank: 1
          };
          effects.push(exp);
        }
      }

      return effects;
    }
  ],
];

const packages: Array<IComponentPackage> = [
  PrimaryComponentPackage.instance,
  VideoPlayerComponentPackage.instance
  // componentPackageRemoteLoader(() => import('primary-component-package/componentPackage') as any)
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
      <ExpressionMonitorRegisterContext.Provider value={expressionMonitorRegister}>
        {props.children && props.children(LowcodeInfrastructureCtx)}
      </ExpressionMonitorRegisterContext.Provider>
    </StoreMonitorContext.Provider>
  );
});

LowcodeInfrastructureComponent.displayName = 'LowcodeInfrastructureComponent';

export default LowcodeInfrastructureComponent;