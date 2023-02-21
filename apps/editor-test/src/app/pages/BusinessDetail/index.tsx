import styles from './index.module.less';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Tabs } from 'antd';
import { observer } from 'mobx-react-lite';
import PageManagement from '../../components/PageManagement';
import BusinessModel from '../../components/BusinessModel';
import { ModelRepository } from '../../models';

const BusinessDetail: React.FC = observer(() => {

  const navigate = useNavigate();
  const { businessModel } = useParams();
  const [title, setTitle] = useState<string>();

  useEffect(() => {
    (async () => {
      console.log(`businessModel:`,businessModel);
      const model = await ModelRepository.getInstance().get(businessModel);
      setTitle(model.name);
    })();
  }, []);

  const goback = useCallback(() => {
    navigate(`/`);
  }, []);

  return (
    <div className={styles['business-detail']}>
      <div className={styles['business-detail__header']}>
        <p className={styles['business-detail__title']}>
          <Button type="text" size='large' shape="circle" icon={<ArrowLeftOutlined className={styles['goback-icon']} />} onClick={goback} />
          <span>{title}</span>
        </p>
      </div>
      <div className={styles['business-detail__content']}>
        <div className={styles['card']}>
          <Tabs
            className={styles['card-tabs']}
            defaultActiveKey="pages"
            items={[
              {
                label: `基本信息`,
                key: 'basic-info',
                children: <BusinessModel />,
              },
              {
                label: `页面布局`,
                key: 'pages',
                children: <PageManagement />,
              }
            ]} />
        </div>
      </div>
    </div>
  );
});

BusinessDetail.displayName = 'BusinessDetail';

export default BusinessDetail;