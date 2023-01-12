import React, { memo, useMemo } from 'react';
import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import SimpleNavsPage, { INavItem } from '../../components/SimpleNavsPage';

const EditorPluginTest: React.FC = memo(observer(() => {
  const routes = useMemo<Array<INavItem>>(() => ([
    {
      title: '模型插件面板',
      path: '/app/editor-plugin-test/model-gallery',
    },
    {
      title: '组件库插件面板',
      path: '/app/editor-plugin-test/component-gallery',
    }
  ]), []);

  return (
    <div className={styles['plugin-test']}>
      <SimpleNavsPage title='设计器插件面板测试' routes={routes} />
    </div>
  );
}));

EditorPluginTest.displayName = 'EditorPluginTest';

export default EditorPluginTest;