import styles from './index.module.less';
import { memo, useCallback, useMemo, useState } from 'react';
import classnames from 'classnames';
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HomeOutlined, LeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';

export interface INavItem {
  title: string;
  path: string;
}

const SIMPLE_NAV_COLLAPSED_STATE = 'simple-nav-collapse-state';

export interface IPageOperationProps {
  title: string;
  routes: Array<INavItem>;
};

export const SimpleNavsPage: React.FC<IPageOperationProps> = memo(props => {

  const navigate = useNavigate();

  const RouterLinks = useMemo(() => {
    if (!props.routes) { return; }
    return props.routes.map(r => (
      <NavLink key={r.title} to={r.path} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <p>{r.title}</p>
      </NavLink >
    ));

  }, [props.routes]);

  const [collapsed, setCollapsed] = useState<boolean>(localStorage.getItem(SIMPLE_NAV_COLLAPSED_STATE) === 'true');

  const toggleCollapse = () => {
    const state = !collapsed;
    setCollapsed(state);
    localStorage.setItem(SIMPLE_NAV_COLLAPSED_STATE, `${state}`)
  };

  const navigateToHome = useCallback(() => {
    navigate('/');
  }, []);

  return (
    <div className={styles['page']}>
      <div className={
        classnames(
          styles['page__navs'],
          {
            [styles['page__navs--collapsed']]: collapsed
          }
        )}>
        <div className={styles['navs']}>
          <div className={styles['navs__header']}>
            <p className={styles['navs__title']}>
              <Button type="text" className={styles['navs__btn']} icon={<HomeOutlined />} size='small' onClick={navigateToHome} />
              <span>{props.title}</span>
            </p>
          </div>
          <div className={styles['navs__content']}>
            {RouterLinks}
          </div>
        </div>
      </div>
      <div className={classnames(
        styles['collapse'],
        {
          [styles['collapse--collapsed']]: collapsed
        }
      )}>
        <div className={styles['collapse__bar']} onClick={toggleCollapse}>
          <LeftOutlined />
        </div>
      </div>
      <div className={styles['page__content']}>
        <Outlet />
      </div>
    </div>
  );
});

SimpleNavsPage.displayName = 'SimpleNavsPage';

