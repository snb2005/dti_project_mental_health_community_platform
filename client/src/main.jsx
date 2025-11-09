import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import router from './App.jsx';
import { RouterProvider } from 'react-router-dom';
import { AppcontextProvider } from './context/AppContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppcontextProvider>
      <ToastContainer />
      <RouterProvider router={router} />
    </AppcontextProvider>
  </StrictMode>,
);
