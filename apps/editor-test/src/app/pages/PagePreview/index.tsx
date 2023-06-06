import React, { useCallback, useContext, useMemo } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../contexts';
import { RendererPluginRegister, Renderer } from '@lowcode-engine/renderer';
import { INavigationBackContext, NavigationBackContext } from '@lowcode-engine/primary-component-package';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { EventActionType, EventCenterEngineContext, IEventCenterEngineContext, IOpenUrlEventAction } from '@lowcode-engine/core';
import LowcodeInfrastructureComponent from '../../components/LowcodeInfrastructure';
import { ExpressionMonitorPluginRegister, StyleHandlerPluginRegister } from './plugins';
import { useEventCenterProvider } from '../../hooks';

const PagePreview: React.FC = observer(() => {

  const navigate = useNavigate();
  const { pageId, businessModel } = useParams();
  const [search] = useSearchParams();
  const store = useContext(StoreContext);

  const schema = store.pageStore.editingPage(pageId);
  const showNavigation = !!search.get('showNav');
  const navigationBackContext = useMemo<INavigationBackContext>(() => ({
    getGoBackContent: () => {
      if (!showNavigation) { return null; }
      return (
        <div className={styles['page-navigation']}>
          <Button type="text" icon={<ArrowLeftOutlined />} size='small' onClick={goback} >返回</Button>
        </div>
      );
    }
  }), [showNavigation]);

  const eventCenter = useEventCenterProvider();

  const goback = useCallback(() => {
    if (window.opener != null && !window.opener.closed) {
      window.close();
    } else {
      window.name = null;
      navigate(`/app/business-detail/${businessModel}`);
    }
  }, []);

  const plugins = useMemo<Array<RendererPluginRegister>>(() => [
    // 组件样式管理器
    StyleHandlerPluginRegister(),
    // 组件表达式管理器
    ExpressionMonitorPluginRegister(),
  ], []);

  return (
    <div className={styles['page-preview']}>
      <EventCenterEngineContext.Provider value={eventCenter}>
        <NavigationBackContext.Provider value={navigationBackContext}>
          <LowcodeInfrastructureComponent>
            {({ packages }) => (<Renderer schema={schema} packages={packages} plugins={plugins} />)}
          </LowcodeInfrastructureComponent>
        </NavigationBackContext.Provider>
      </EventCenterEngineContext.Provider>
    </div>
  );
});

PagePreview.displayName = 'PagePreview';

export default PagePreview;