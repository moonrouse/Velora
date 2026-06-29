import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard.jsx';
import { fetchProducts } from '../services/products.js';
import { selectLocale, selectSearchQuery } from '../redux/uiSlice.js';
import { useTranslation } from '../hooks/useTranslation.js';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import { motion } from 'framer-motion';
import { FiArrowDown, FiRefreshCw, FiShield, FiTruck, FiZap } from 'react-icons/fi';

const PRODUCTS_PER_PAGE = 12;

function HomePage() {
  const searchQuery = useSelector(selectSearchQuery);
  const locale = useSelector(selectLocale);
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const hasLoadedCatalog = useRef(false);

  useEffect(() => {
    setLoading(!hasLoadedCatalog.current);
    setError('');
    fetchProducts(100, locale)
      .then((fetchedProducts) => {
        setProducts(fetchedProducts);
        // derive unique categories from products (value = slug, label = localized label)
        const map = new Map();
        fetchedProducts.forEach((p) => {
          const value = p.category;
          const label = p.categoryLabel || value;
          if (!map.has(value)) map.set(value, { value, label });
        });
        const derived = Array.from(map.values());
        setCategories(derived);
        setSelectedCategory('all');
        hasLoadedCatalog.current = true;
      })
      .catch(() => {
        setError(t('errorMessage'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [locale, t, retryKey]);

  useEffect(() => {
    setSelectedCategory('all');
  }, [locale]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = [product.name, product.categoryLabel, product.description]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [products, normalizedSearch, selectedCategory]);

  const pagedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return visibleProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [visibleProducts, currentPage]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE));
  const categoryOptions = [{ value: 'all', label: t('allCategories') }, ...categories];
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  if (loading) {
    return (
      <section className="page-home shell" aria-live="polite">
        <div className="hero-skeleton skeleton" />
        <div className="product-grid product-grid--loading">
          {Array.from({ length: 8 }, (_, index) => <div className="product-skeleton skeleton" key={index} />)}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-home shell center-screen status-block">
        <div className="empty-icon"><FiRefreshCw /></div>
        <h1>{t('loadErrorTitle')}</h1>
        <p>{error}</p>
        <button type="button" className="button button--primary" onClick={() => setRetryKey((value) => value + 1)}>{t('retry')}</button>
      </section>
    );
  }

  return (
    <section className="page-home shell">
      <motion.div className="hero-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
        <div className="hero-panel__content">
          <span className="eyebrow"><span /> {t('newCollection')}</span>
          <h1>{t('heroTitle')}</h1>
          <p>{t('heroDescription')}</p>
          <div className="hero-panel__actions">
            <a href="#catalog" className="button button--primary">{t('shopNow')} <FiArrowDown /></a>
            <span>{t('deliveryNote')}</span>
          </div>
        </div>
        <div className="hero-panel__visual" aria-hidden="true">
          <div className="orb orb--one" />
          <div className="orb orb--two" />
          <div className="hero-stat hero-stat--main"><strong>100+</strong><span>{t('curatedProducts')}</span></div>
          <div className="hero-stat hero-stat--small"><FiZap /><span>{t('fastShopping')}</span></div>
        </div>
      </motion.div>

      <div className="benefits" aria-label={t('benefits')}>
        <div><FiTruck /><span><strong>{t('fastDelivery')}</strong><small>{t('fastDeliveryText')}</small></span></div>
        <div><FiShield /><span><strong>{t('securePayment')}</strong><small>{t('securePaymentText')}</small></span></div>
        <div><FiZap /><span><strong>{t('bestPrices')}</strong><small>{t('bestPricesText')}</small></span></div>
      </div>

      <div className="section-header section-header--with-actions" id="catalog">
        <div>
          <h2>{t('products')}</h2>
          <p>{t('showingResults', { count: visibleProducts.length })}</p>
        </div>
      </div>

      <div className="category-filters">
        {categoryOptions.map((category) => (
          <button
            key={category.value}
            type="button"
            className={`button button--ghost category-filter ${category.value === selectedCategory ? 'category-filter--active' : ''}`}
            onClick={() => handleCategoryChange(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* removed highlight blocks - only catalog is shown */}

      {visibleProducts.length === 0 ? (
        <EmptyState message={t('emptyState')} />
      ) : (
        <>
          <motion.div className="product-grid" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.045 } } }}>
            {pagedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </>
      )}
    </section>
  );
}

export default HomePage;
