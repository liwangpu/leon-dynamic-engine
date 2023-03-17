import React, { useCallback, useContext, useMemo } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ComponentPackageContext, StoreContext } from '../../contexts';
import { Renderer } from '@lowcode-engine/renderer';
import { INavigationBackContext, NavigationBackContext } from '@lowcode-engine/primary-component-package';
import { Button } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { EventActionType, EventCenterEngineContext, IEventAction, IEventCenterEngineContext, IOpenUrlEventAction } from '@lowcode-engine/core';

const PagePreview: React.FC = observer(() => {

  const navigate = useNavigate();
  const { pageId, businessModel } = useParams();
  const [search, setSearch] = useSearchParams();
  const store = useContext(StoreContext);
  const packages = useContext(ComponentPackageContext);
  const schema = store.pageStore.editingPage(pageId);
  const showNavigation = !!search.get('showNav');
  const navigationBackContext = useMemo<INavigationBackContext>(() => ({
    getGoBackContent: () => {
      if (!showNavigation) { return null; }
      return (
        <div className={styles['page-navigation']}>
          <Button type="text" icon={<ArrowLeftOutlined />} size='small' onClick={goback} >返回</Button>
          <Button type="text" icon={<EditOutlined />} shape="circle" onClick={editoPage} />
        </div>
      );
    }
  }), [showNavigation]);

  const eventEngineContext = useMemo<IEventCenterEngineContext>(() => {

    const openUrlHandler = async (action: IOpenUrlEventAction, data?: any) => {
      window.open(action.params.url, action.params.target);
    };
    
    return {
      dispatch: async (event, data) => {

        if (event.execute && event.execute.actions) {
          for (const act of event.execute.actions) {
            switch (act.type) {
              case EventActionType.openUrl:
                await openUrlHandler(act, data);
                break;
              default:
                console.warn(`没有找到对应动作类型的执行器,动作将不生效`, act, data);
                break;
            }
          }
        }
      },
    };
  }, []);

  const goback = useCallback(() => {
    navigate(`/app/business-detail/${businessModel}`);
  }, []);

  const editoPage = useCallback(() => {
    navigate(`/app/page-editor/${businessModel}/${pageId}`);
  }, []);

  return (
    <div className={styles['page-preview']}>
      <EventCenterEngineContext.Provider value={eventEngineContext}>
        <NavigationBackContext.Provider value={navigationBackContext}>
          {schema && <Renderer schema={schema} packages={packages} />}
        </NavigationBackContext.Provider>
      </EventCenterEngineContext.Provider>
    </div>
  );
});

PagePreview.displayName = 'PagePreview';

export default PagePreview;