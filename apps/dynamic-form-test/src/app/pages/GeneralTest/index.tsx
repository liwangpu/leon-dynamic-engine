import React, { memo } from 'react';
import styles from './index.module.less';
import { Button } from 'antd';
import { IRealTimeRendererRefType, RealTimeRenderer } from '@app-test/spare-parts';
import { FormBuilder, IFormMetadata, SetterType } from '@lowcode-engine/dynamic-form';

const GeneralTest: React.FC = memo(() => {

  const ref = React.createRef<IRealTimeRendererRefType>();

  const setGeneralForm = () => {
    let md: IFormMetadata = {
      children: [
        {
          key: 'tabs',
          setter: SetterType.tabs,
          children: [
            {
              key: 't测试',
              title: '测试',
              children: [
                {
                  key: 'g1',
                  setter: SetterType.group,
                  name: 'student',
                  children: [
                    {
                      key: 'name',
                      setter: SetterType.string,
                      label: '姓名',
                      name: 'name'
                    },
                    {
                      key: 'age',
                      setter: SetterType.number,
                      label: '年纪',
                      name: 'age'
                    },
                    {
                      key: 'married',
                      setter: SetterType.boolean,
                      label: '已婚',
                      name: 'married'
                    },
                  ],
                }
              ]
            },
            {
              key: 't属性',
              title: '属性',
              children: [
                {
                  key: 'p1',
                  label: '基础信息',
                  setter: SetterType.primaryHeading,
                  children: [
                    {
                      key: 'title',
                      setter: SetterType.string,
                      label: '标题',
                      name: 'title'
                    },
                  ],
                },
              ]
            }
          ]
        }
      ]
    };
    ref.current.setValue(md);
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
