import styles from './index.module.scss';
import { memo, useMemo } from 'react';
import { SimpleNavsPage, INavItem } from '@app-test/spare-parts';

const App: React.FC = memo(() => {

  const routes = useMemo<Array<INavItem>>(() => ([
    {
      title: '综合测试',
      path: '/app/general-test',
    },
  ]), []);

  return (
    <div className={styles['tutorial-app']}>
      <SimpleNavsPage title='动态表单测试' routes={routes} />
    </div>
  );
});

export default App;