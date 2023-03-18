import React, { memo, useCallback } from 'react';
import styles from './index.module.less';
import { Button } from 'antd';
import { IRealTimeRendererRefType, RealTimeRenderer, useLocalStorage } from '@app-test/spare-parts';
import { FormBuilder, IFormMetadata, SetterType } from '@lowcode-engine/dynamic-form';
import registerSetter, { CustomListFooter, CustomListItem } from './setters';

registerSetter();

const GeneralTest: React.FC = memo(() => {

  const ref = React.createRef<IRealTimeRendererRefType>();
  const { value, setValue } = useLocalStorage('general-test-form-value');

  const setGeneralForm = useCallback(() => {
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
                },
                {
                  key: 'user1',
                  setter: SetterType.list,
                  name: 'users',
                  label: '用户',
                  listItem: 'cus-item',
                  sortable: true,
                  dragHandle: '.drag-handle',
                  listFooter: 'cus-footer',
                },
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
  }, []);

  const setTestForm = useCallback(() => {
    let md: IFormMetadata = {
      children: [
        {
          key: 'grid-layout',
          setter: SetterType.gridLayout,
          children: [
            {
              key: 'title',
              setter: SetterType.string,
              name: 'title',
              label: '标题',
              gridColumnSpan: '1/2',
            },
            {
              key: 'remark',
              setter: SetterType.string,
              name: 'remark',
              label: '备注',
              gridColumnSpan: '1/2',
            },
            {
              key: 'target',
              setter: SetterType.select,
              name: 'target',
              label: '选项',
              multiple: true,
              gridColumnSpan: '1/2',
              data: [
                { value: 'a', label: 'A' },
                { value: 'b', label: 'B' },
                { value: 'c', label: 'C' },
              ]
            },
            {
              key: 'user',
              setter: SetterType.group,
              name: 'user',
              children: [
                {
                  key: 'name',
                  setter: SetterType.string,
                  name: 'name',
                  label: '姓名',
                  gridColumnSpan: '1/2',
                },
                {
                  key: 'remark',
                  setter: SetterType.string,
                  name: 'remark',
                  label: '备注',
                  gridColumnSpan: '1/2',
                },
              ]
            }
          ]
        }
      ]
    };
    ref.current.setValue(md);
  }, []);

  const resetFormValue = useCallback(() => {
    setValue(undefined);
    location.reload();
  }, []);

  const onChange = (val: any) => {
    console.log(`value change:`, val);
    setValue(val);
  };

  return (
    <div className={styles['page']}>
      <div className={styles['page__header']}>
        <Button type="primary" size='small' danger onClick={resetFormValue}>清除表单值</Button>
        <Button type="primary" size='small' onClick={setGeneralForm}>通用表单</Button>
        <Button type="default" size='small' onClick={setTestForm}>测试表单</Button>
      </div>
      <div className={styles['page__content']}>
        <RealTimeRenderer storageKey='general-test-renderer' ref={ref} >
          {val => (
            <FormBuilder metadata={val} value={value} onChange={onChange} />
          )}
        </RealTimeRenderer>
      </div>
    </div>
  );
});

GeneralTest.displayName = 'GeneralTest';

export default GeneralTest;
