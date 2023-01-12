import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { memo, useCallback } from 'react';
import React from 'react';
import { IProjectManager } from '@tiangong/editor';
import { PageRepository } from '../../models';
import { Button, notification } from 'antd';
import { IProjectSchema } from '@tiangong/core';
import { ClearOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

export type PageOperationProps = {
  project: IProjectManager
};

const PageEditorOperation: React.FC<PageOperationProps> = memo(observer(props => {

  const navigate = useNavigate();
  const { pageId, businessModel } = useParams();

  const clear = useCallback(async () => {
    const schema = props.project.export();
    const newSchema: IProjectSchema = {
      ...schema,
      children: [],
      operators: []
    };
    await PageRepository.getInstance().update(newSchema.id, newSchema);
    props.project.import(newSchema);
    showMessage('清空成功');
  }, []);

  const saveSchema = useCallback(async (): Promise<void> => {
    const schema = props.project.export();
    // console.log(`schema save:`, schema);
    await PageRepository.getInstance().update(schema.id, schema);
    showMessage();
  }, []);

  const showMessage = useCallback((msg?: string) => {
    notification.open({
      message: '温馨提示',
      description:
        msg || '数据保存成功',
      placement: 'bottomRight',
      duration: 2.5
    });
  }, []);

  const previewPage = useCallback(() => {
    window.open(`/app/page-preview/${businessModel}/${pageId}`, '_blank');
  }, []);

  return (
    <div className={styles['page-operation']}>
      <Button type="default" icon={<EyeOutlined />} onClick={previewPage} size='small'>预览</Button>
      <Button type="primary" danger icon={<SaveOutlined />} onClick={clear} size='small'>清空</Button>
      <Button type="primary" icon={<ClearOutlined />} onClick={saveSchema} size='small'>保存</Button>
    </div>
  );
}));

PageEditorOperation.displayName = 'PageEditorOperation';

export default PageEditorOperation;