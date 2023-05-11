import React, { memo, useCallback, useMemo } from 'react';
import './index.less';
import { useNavigate } from 'react-router-dom';
import { SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown } from 'antd';

const Home: React.FC = memo(() => {
  const navigate = useNavigate();
  const gotoBusinessDetail = useCallback((businessModel: string) => {
    navigate(`/app/business-detail/${businessModel}`);
  }, []);

  const gotoSimplePageEditor = useCallback(() => {
    navigate(`/app/simple-page-editor`);
  }, []);

  const gotoEditorPluginTest = useCallback(() => {
    navigate(`/app/editor-plugin-test`);
  }, []);

  const settingItems = useMemo<MenuProps['items']>(() => ([
    {
      key: 'simple-page-editor',
      label: (
        <span>简易页面设计器</span>
      ),
      onClick: gotoSimplePageEditor
    },
    // {
    //   key: 'editor-plugin-test',
    //   label: (
    //     <span>设计器插件测试</span>
    //   ),
    //   onClick: gotoEditorPluginTest
    // },
  ]), []);

  return (
    <div className='app-home'>
      {/* <div className="animation-container">
        <div className="lightning-container">
          <div className="lightning white"></div>
          <div className="lightning red"></div>
        </div>
        <div className="boom-container">
          <div className="shape circle big white"></div>
          <div className="shape circle white"></div>
          <div className="shape triangle big yellow"></div>
          <div className="shape disc white"></div>
          <div className="shape triangle blue"></div>
        </div>
        <div className="boom-container second">
          <div className="shape circle big white"></div>
          <div className="shape circle white"></div>
          <div className="shape disc white"></div>
          <div className="shape triangle blue"></div>
        </div>
      </div> */}
      <div className="header">
        <p className="title">动态引擎演示</p>
      </div>
      <div className="operation">
        <button onClick={() => gotoBusinessDetail('rfx')}>询价单</button>
        <button onClick={() => gotoBusinessDetail('supplier')}>供应商</button>
      </div>
      <div className='setting'>
        <Dropdown menu={{ items: settingItems }} >
          <Button type='text'>
            <SettingOutlined className='setting__icon' spin={true} />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;