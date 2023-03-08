import React, { memo } from 'react';
import styles from './index.module.less';
import RealTimeRenderer from '../../components/RealTimeRenderer';

const GeneralTest: React.FC = memo(() => {

  // const [schema, setSchema] = useState<IProjectSchema>(getSchemaCache());

  return (
    <div className={styles['page']}>
      <div className={styles['page__header']}>

      </div>
      <div className={styles['page__content']}>
        <RealTimeRenderer value={null} />
      </div>
    </div>
  );
});

GeneralTest.displayName = 'GeneralTest';

export default GeneralTest;
