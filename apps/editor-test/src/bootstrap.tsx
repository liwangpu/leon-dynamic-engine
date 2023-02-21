import * as ReactDOM from 'react-dom/client';
import App from './app';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import React, { Suspense } from 'react';
import { createStore } from './app/stores';
import { StoreContext } from './app/contexts';
import { ModelRepository, PageRepository } from './app/models';

const store = createStore();

const Home = React.lazy(() => import('./app/pages/Home'));
const BusinessDetail = React.lazy(() => import('./app/pages/BusinessDetail'));
const PageEditor = React.lazy(() => import('./app/pages/PageEditor'));
const PagePreview = React.lazy(() => import('./app/pages/PagePreview'));
const EditorPluginTest = React.lazy(() => import('./app/pages/EditorPluginTest'));
const ComponentGalleryTest = React.lazy(() => import('./app/pages/ComponentGalleryTest'));
const ModelGalleryTest = React.lazy(() => import('./app/pages/ModelGalleryTest'));

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
        path: 'business-detail/:businessModel',
        element: WrapperSuspense(BusinessDetail),
        loader: async ({ params }) => {
          await store.pageStore.refresh(params['businessModel']);
          return true;
        },
      },
      {
        path: 'page-editor/:businessModel/:pageId',
        element: WrapperSuspense(PageEditor),
        loader: async ({ params }) => {
          const model = await ModelRepository.getInstance().get(params['businessModel']);
          const schema = await PageRepository.getInstance().get(params['pageId']);
          return { model, schema };
        }
      },
      {
        path: 'page-preview/:businessModel/:pageId',
        element: WrapperSuspense(PagePreview),
        loader: async ({ params }) => {
          await store.pageStore.getPage(params['pageId']);
          return true;
        },
      },
      {
        path: 'editor-plugin-test',
        element: WrapperSuspense(EditorPluginTest),
        children: [
          {
            path: 'component-gallery',
            element: WrapperSuspense(ComponentGalleryTest),
          },
          {
            path: 'model-gallery',
            element: WrapperSuspense(ModelGalleryTest),
          },
          {
            index: true,
            element: <Navigate to="component-gallery" replace={true} />,
          },
        ]
      },
      {
        index: true,
        element: <Navigate to="business-detail" replace={true} />,
      }
    ],
    loader: async () => {
      await store.modelStore.refresh();
      return true;
    }
  },
  {
    path: 'home',
    element: WrapperSuspense(Home),
  },
  {
    index: true,
    element: <Navigate to="/home" replace={true} />,
  },
  {
    path: '*',
    element: <Navigate to="/home" replace={true} />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StoreContext.Provider value={store}>
    <RouterProvider router={router} />
  </StoreContext.Provider>
);
