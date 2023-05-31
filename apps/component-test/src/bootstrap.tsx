import React, { Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import App from './app';

const FullPage = React.lazy(() => import('./app/pages/FullPage'));
const TableTest = React.lazy(() => import('./app/pages/TableTest'));
const RendererTest = React.lazy(() => import('./app/pages/RendererTest'));


function WrapperSuspense(WrappedComponent: React.ComponentType) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WrappedComponent />
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    path: "app",
    element: <App />,
    children: [
      {
        path: 'full-page',
        element: WrapperSuspense(FullPage),
      },
      {
        path: 'table-test',
        element: WrapperSuspense(TableTest),
      },
      {
        path: 'renderer-test',
        element: WrapperSuspense(RendererTest),
      },
      {
        index: true,
        element: <Navigate to="full-page" replace={true} />,
      }
    ]
  },
  {
    index: true,
    element: <Navigate to="/app" replace={true} />,
  },
  {
    path: '*',
    element: <Navigate to="/app" replace={true} />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <RouterProvider router={router} />
);
