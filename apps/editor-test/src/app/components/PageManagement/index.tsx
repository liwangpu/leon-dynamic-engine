import styles from './index.module.less';
import { useParams } from "react-router-dom";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { StoreContext } from '../../contexts';
import { observer } from 'mobx-react-lite';
import { IComponentConfiguration } from '@lowcode-engine/core';
import PageDetail from '../PageDetail';
import { values } from 'mobx';
import classnames from 'classnames';
import { ComponentTypes } from '@lowcode-engine/primary-component-package';

const PageGroupInfos = [
  {
    type: ComponentTypes.listPage,
    title: '列表页'
  },
  {
    type: ComponentTypes.detailPage,
    title: '详情页'
  },
];

const PageManagement: React.FC = observer(() => {

  const { businessModel } = useParams();
  const store = useContext(StoreContext);
  const pages: Array<IComponentConfiguration> = values(store.pageStore.pages) || [] as any;
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [pageType, setPageType] = useState<string>();
  const [deletedPageId, setDeletedPageId] = useState<string>(null);

  const onEditPage = useCallback((id: string, pageType: string) => {
    window.open(`/app/page-editor/${businessModel}/${id}?pageType=${pageType}`, `page-editor@${businessModel}#${id}`);
  }, []);

  const onPreviewPage = useCallback((id: string) => {
    window.open(`/app/page-preview/${businessModel}/${id}?showNav=true`, `preview-page@${businessModel}#${id}`);
  }, []);

  const onDeletePage = (id: string) => {
    setDeletedPageId(id);
  };

  const addPage = (pageType: string) => {
    setPageType(pageType);
    setAddModalVisible(true);
  };

  const deletePage = async () => {
    await store.pageStore.deletePage(deletedPageId);
    store.pageStore.refresh(businessModel);
    closeDeleteModal();
  };

  const savePage = async (page: { [key: string]: any }) => {
    closeAddingModal();
    const id = await store.pageStore.addPage(page);
    window.open(`/app/page-editor/${businessModel}/${id}?pageType=${pageType}`, `page-editor@${businessModel}#${id}`);
  };

  const closeAddingModal = () => {
    setAddModalVisible(false);
  };

  const closeDeleteModal = () => {
    setDeletedPageId(null);
  };

  const PageGroups = useMemo(() => {
    return PageGroupInfos.map(g => (
      <div className={styles['page-group']} key={g.title}>
        <p className={styles['page-group__title']}>{g.title}</p>
        <div className={styles['page-group__content']}>
          {
            pages.filter(p => p.type === g.type).map(p => (
              <div className={styles['page']} key={p.id}>
                <p className={styles['page__title']}>{p.title}</p>
                <p className={styles['page__info']}>编码：{p.id}</p>
                <p className={styles['page__info']}>主业务对象</p>
                <div className={styles['page__tools']}>
                  <Button type="text" size='small' shape="circle" className={classnames(
                    styles['tool-button'],
                    styles['tool-button--preview'],
                  )} icon={<EyeOutlined />} onClick={() => onPreviewPage(p.id)} />
                  <Button type="text" size='small' shape="circle" className={classnames(
                    styles['tool-button'],
                    styles['tool-button--edit'],
                  )} icon={<EditOutlined />} onClick={() => onEditPage(p.id, g.type)} />
                  <Button type="text" size='small' shape="circle" className={
                    classnames(
                      styles['tool-button'],
                      styles['tool-button--deleted'],
                    )} icon={<DeleteOutlined />} onClick={() => onDeletePage(p.id)} />
                </div>
              </div>
            ))
          }
          <div className={styles['page-adding-button']} onClick={() => addPage(g.type)}>
            <PlusOutlined />
          </div>
        </div>
      </div>
    ))
  }, [pages]);

  return (
    <div className={styles['page-management']}>
      <div className={styles['page-management__header']}>
        <Input placeholder="请输入关键字" size="small" className={styles['search-input']} suffix={<SearchOutlined />} />
      </div>
      <div className={styles['page-management__content']}>
        {PageGroups}

        <Modal title="新建页面"
          destroyOnClose={true}
          open={addModalVisible}
          footer={null}
          onCancel={closeAddingModal}
          bodyStyle={{ padding: '12px 12px 6px' }}
        >
          <PageDetail pageType={pageType} onConfirm={savePage} onCancel={closeAddingModal} />
        </Modal>

        <Modal
          title="温馨提示"
          open={!!deletedPageId}
          onOk={deletePage}
          onCancel={closeDeleteModal}
          okText="确认"
          cancelText="取消" >
          <p>您确定要删除该页面吗？</p>
        </Modal>
      </div>
    </div>
  );
});

PageManagement.displayName = 'PageManagement';

export default PageManagement;