import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard.jsx';
import { fetchProducts } from '../services/products.js';
import { selectLocale, selectSearchQuery } from '../redux/uiSlice.js';
import { useTranslation } from '../hooks/useTranslation.js';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';

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

  useEffect(() => {
    setLoading(true);
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
      })
      .catch(() => {
        setError(t('errorMessage'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [locale, t]);

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
      <section className="page-home shell center-screen">
        <p>{t('loading')}</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-home shell center-screen">
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="page-home shell">
      <div className="hero-panel">
        <div>
          <span className="eyebrow">{t('products')}</span>
          <h1>{t('heroTitle')}</h1>
          <p>{t('heroDescription')}</p>
        </div>
      </div>

      <div className="section-header section-header--with-actions">
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
          <div className="product-grid">
            {pagedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </>
      )}
    </section>
  );
}

export default HomePage;
