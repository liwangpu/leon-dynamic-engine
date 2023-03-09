import React, { memo } from 'react';
import styles from './index.module.less';
import { Button } from 'antd';
import { IRealTimeRendererRefType, RealTimeRenderer } from '@app-test/spare-parts';
import { FormBuilder } from '@lowcode-engine/dynamic-form';

const GeneralTest: React.FC = memo(() => {

  const ref = React.createRef<IRealTimeRendererRefType>();

  const setGeneralForm = () => {
    ref.current.setValue({
      name: 'a',
      age: 18
    });
  };

  return (
    <div className={styles['page']}>
      <div className={styles['page__header']}>
        <Button type="primary" size='small' onClick={setGeneralForm}>通用表单</Button>
      </div>
      <div className={styles['page__content']}>
        <RealTimeRenderer storageKey='general-test-renderer' ref={ref} >
          {val => (
            <FormBuilder metadata={val} />
          )}
        </RealTimeRenderer>
      </div>
    </div>
  );
});

GeneralTest.displayName = 'GeneralTest';

export default GeneralTest;
