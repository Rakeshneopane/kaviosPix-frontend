import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate } from 'react-router-dom';

import { Provider } from 'react-redux';
import { store } from './store/store.js';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { GoogleCallbackPage } from './pages/GoogleCallbackPage.jsx';
import { DashBoardPage } from './pages/DashBoardPage.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import AlbumsPage from './components/albums/AlbumsPage.jsx';
import AlbumDetailPage from "./components/albums/AlbumDetailsPage.jsx"

const router = createBrowserRouter([ 
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/v1/profile/google",
    element: <GoogleCallbackPage />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute> 
        <App /> 
      </ProtectedRoute>
    ),
    errorElement: <h1> Something Went Wrong. </h1>,
    hydrateFallbackElement: <h1> Fallback Element: Loading... Just for reference now.</h1>,
    children: [
      {
        index: true,          
        element: <Navigate to="dashboard" replace={true} /> 
      },      
      {
        path: "/dashboard",
        element: <DashBoardPage />
      },
      {
        path: "/albums",
        element: <AlbumsPage />
      },
      {
        path: "/album/:albumId",
        element: <AlbumDetailPage />
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </>,
)
