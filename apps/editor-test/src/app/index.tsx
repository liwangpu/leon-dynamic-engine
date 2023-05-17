import styles from './index.module.less';
import { Outlet } from "react-router-dom";
import { memo } from 'react';

const App: React.FC = memo(() => {

  return (
    <div className={styles['app']}>
      <Outlet />
    </div>
  );
});

export default App;