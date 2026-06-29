import { lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
// Notifications removed: react-toastify and custom toast styles deleted
import AppLayout from './layouts/AppLayout.jsx';
import { selectLocale, selectTheme } from './redux/uiSlice.js';
import { useTranslation } from './hooks/useTranslation.js';
import PageLoader from './components/PageLoader.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'));

function App() {
  const theme = useSelector(selectTheme);
  const locale = useSelector(selectLocale);
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);

  return (
    <div className="app-shell">
      <ScrollToTop />
      <AppLayout>
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AppLayout>
      {/* Notifications removed: UI updates indicate actions (no toasts) */}
    </div>
  );
}

export default App;
