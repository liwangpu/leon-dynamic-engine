import React, { memo, useContext, useEffect, useMemo, useState } from 'react';
import { IComponentPackage, IProjectSchema, IPlugin, useStoreMonitorHosting, DynamicComponentFactoryContext, DataCenterEngineContext } from '@lowcode-engine/core';
import * as _ from 'lodash';
import './index.less';
import { IRendererContext, RendererContextManager, RendererPluginRegister } from '../../models';
import { RendererContext } from '../../contexts';
import { STORE_NAME } from '../../consts';
import ExpressionDetector from '../ExpressionDetector';

export interface RendererProps {
  schema: IProjectSchema;
  packages: Array<IComponentPackage>;
  plugins?: Array<RendererPluginRegister>;
}

export const _Renderer: React.FC<{ schema: IProjectSchema }> = memo(({ schema }) => {

  const { componentFactory, dataCenter } = useContext(RendererContext);
  const DynamicComponent = componentFactory.getDynamicComponentFactory();

  return (
    <DataCenterEngineContext.Provider value={dataCenter}>
      <DynamicComponent configuration={schema} />
      <ExpressionDetector />
    </DataCenterEngineContext.Provider>
  );
});

_Renderer.displayName = '_Renderer';

export const Renderer: React.FC<RendererProps> = memo(({ schema, packages, plugins: pluginRegister }) => {

  const [initialized, setInitialized] = useState(false);

  const context = useMemo<IRendererContext>(() => {
    const ctx = new RendererContextManager(packages);
    return ctx;
  }, [packages, pluginRegister]);

  useStoreMonitorHosting(STORE_NAME, context.store);

  useEffect(() => {
    const plugins: Array<IPlugin> = [];
    if (pluginRegister?.length) {
      for (const register of pluginRegister) {
        const plugin = register(context);
        plugins.push(plugin);
      }
    }
    (async () => {
      const slotInfo = await context.componentDiscovery.queryComponentSlotInfo();
      context.slot.registerMap(slotInfo);

      for (const plugin of plugins) {
        await plugin.init();
      }

      context.project.import(schema);
      setInitialized(true);
    })();

    return () => {
      setInitialized(false);
      plugins.forEach(plugin => {
        if (_.isFunction(plugin.destroy)) {
          plugin.destroy();
        }
      });
    };
  }, [context]);

  return (
    <RendererContext.Provider value={context}>
      <DynamicComponentFactoryContext.Provider value={context.componentFactory}>
        {initialized && <_Renderer schema={schema} />}
      </DynamicComponentFactoryContext.Provider>
    </RendererContext.Provider>
  );
});

Renderer.displayName = 'Renderer';
