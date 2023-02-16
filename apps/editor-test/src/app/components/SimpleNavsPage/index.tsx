import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import classnames from 'classnames';
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export interface INavItem {
  title: string;
  path: string;
}

export interface IPageOperationProps {
  title: string;
  routes: Array<INavItem>;
};

const SimpleNavsPage: React.FC<IPageOperationProps> = observer(props => {

  const RouterLinks = useMemo(() => {
    if (!props.routes) { return; }
    return props.routes.map(r => (
      <NavLink key={r.title} to={r.path} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <p>{r.title}</p>
      </NavLink >
    ));

  }, [props.routes]);

  return (
    <div className={styles['navs-page']}>
      <div className={
        classnames(
          styles['navs-page__navs'],
          styles['navs']
        )}>
        <div className={styles['navs']}>
          <div className={styles['navs__header']}>
            <p className={styles['navs__title']}>{props.title}</p>
          </div>
          <div className={styles['navs__content']}>
            {RouterLinks}
          </div>
        </div>
      </div>
      <div className={styles['navs-page__page']}>
        <Outlet />
      </div>
    </div>
  );
});

SimpleNavsPage.displayName = 'SimpleNavsPage';

export default SimpleNavsPage;