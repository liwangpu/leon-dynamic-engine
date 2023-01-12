import React, { memo, useCallback, useContext, useMemo } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ComponentPackageContext, StoreContext } from '../../contexts';
import { Renderer } from '@tiangong/renderer';
import { INavigationBackContext, NavigationBackContext } from '@tiangong/primary-component-package';
import { Button } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';

const PagePreview: React.FC = memo(observer(() => {

  const navigate = useNavigate();
  const { pageId, businessModel } = useParams();
  const [search, setSearch] = useSearchParams();
  const store = useContext(StoreContext);
  const packages = useContext(ComponentPackageContext);
  const schema = store.pageStore.editingPage(pageId);
  const showNavigation = !!search.get('showNav');
  const navigationBack = useMemo<INavigationBackContext>(() => ({
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

  const goback = useCallback(() => {
    navigate(`/app/business-detail/${businessModel}`);
  }, []);

  const editoPage = useCallback(() => {
    navigate(`/app/page-editor/${businessModel}/${pageId}`);
  }, []);

  return (
    <div className={styles['page-preview']}>
      <NavigationBackContext.Provider value={navigationBack}>
        {schema && <Renderer schema={schema} packages={packages} />}
      </NavigationBackContext.Provider>
    </div>
  );
}));

PagePreview.displayName = 'PagePreview';

export default PagePreview;