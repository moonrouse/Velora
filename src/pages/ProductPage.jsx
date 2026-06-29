import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiHeart, FiShield, FiStar, FiTruck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { addToCart, removeFromCart, toggleFavorite, selectCart, selectFavorites } from '../redux/cartSlice.js';
import { fetchProductById } from '../services/products.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { selectLocale } from '../redux/uiSlice.js';

function ProductPage() {
  const { id } = useParams();
  const productId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const locale = useSelector(selectLocale);
  const { t } = useTranslation();
  const cart = useSelector(selectCart);
  const favorites = useSelector(selectFavorites);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const loadedProductId = useRef(null);

  useEffect(() => {
    if (!id) {
      setErrorType('not_found');
      setError(t('productNotFoundText'));
      setLoading(false);
      return;
    }

    if (Number.isNaN(productId)) {
      setErrorType('not_found');
      setError(t('productNotFoundText'));
      setLoading(false);
      return;
    }

    const isNewProduct = loadedProductId.current !== productId;
    setLoading(isNewProduct);
    setError('');
    setErrorType('');
    if (isNewProduct) setProduct(null);

    fetchProductById(productId, locale)
      .then((data) => {
        setProduct(data);
        loadedProductId.current = productId;
      })
      .catch((fetchError) => {
        if (fetchError?.message === 'PRODUCT_NOT_FOUND') {
          setErrorType('not_found');
          setError(t('productNotFoundText'));
        } else {
          setErrorType('api_error');
          setError(t('errorMessage'));
        }
      })
      .finally(() => setLoading(false));
  }, [productId, locale, t]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const isInCart = useMemo(
    () => product && cart.some((item) => item.id === product.id),
    [cart, product],
  );

  const isFavorited = useMemo(
    () => product && favorites.some((item) => item.id === product.id),
    [favorites, product],
  );

  const productDetails = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.details)) return product.details;
    if (product.details) return [product.details];
    return [product.brand || product.categoryLabel || t('productDetails')];
  }, [product, t]);

  const handleCartAction = useCallback(() => {
    if (!product) return;
    if (isInCart) {
      dispatch(removeFromCart(product.id));
      return;
    }
    dispatch(addToCart(product));
  }, [dispatch, isInCart, product, t]);

  const handleFavoriteToggle = useCallback(() => {
    if (!product) return;
    dispatch(toggleFavorite(product));
    // Favorite icon and counters will update automatically via Redux state
  }, [dispatch, isFavorited, product, t]);

  const discountPrice = useMemo(() => (product ? (product.price * (100 - product.discount)) / 100 : 0), [product]);

  if (loading) {
    return (
      <section className="status-block shell center-screen">
        <p>{t('loading')}</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="status-block shell center-screen">
        <h1>{errorType === 'not_found' ? t('productNotFoundTitle') : t('notFoundTitle')}</h1>
        <p>{error || (errorType === 'not_found' ? t('productNotFoundText') : t('notFoundText'))}</p>
        <div className="product-page__error-actions">
          <button type="button" className="button button--ghost" onClick={goBack}>{t('back')}</button>
          <Link to="/" className="button button--primary">{t('home')}</Link>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="page-section shell product-page"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="product-page__top">
        <button type="button" className="button button--ghost product-page__back" onClick={goBack}>
          <FiArrowLeft /> {t('back')}
        </button>
        <div className="product-page__navigation-buttons">
          <button type="button" className="button button--ghost" onClick={() => navigate('/')}>{t('home')}</button>
          <Link to="/" className="button button--primary">{t('backToCatalog')}</Link>
        </div>
      </div>
      <div className="product-detail-card">
        <motion.div
          className="product-detail-card__image"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          whileHover={{ scale: 1.02 }}
        >
          <img src={product.image} alt={product.name} loading="lazy" />
        </motion.div>
        <motion.div
          className="product-detail-card__content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: 'easeOut' }}
        >
          <div className="product-detail-card__header">
            <span className="product-detail-card__category">{product.categoryLabel}</span>
            <h1>{product.name}</h1>
            <div className="product-detail-card__rating"><FiStar /> {Number(product.rating || 0).toFixed(1)} · {product.stock} {t('inStock')}</div>
          </div>
          <p className="product-detail-card__description">{product.description}</p>
          <div className="product-detail-card__pricing">
            <div>
              <p className="product-detail-card__price-original">${product.price.toFixed(2)}</p>
              <p className="product-detail-card__price">${discountPrice.toFixed(2)}</p>
            </div>
            <span className="product-detail-card__discount">{t('discountLabel')}: {product.discount}%</span>
          </div>
          <div className="product-detail-card__actions">
            <motion.button
              type="button"
              className="button button--primary button--premium"
              onClick={handleCartAction}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isInCart ? t('removeFromCart') : t('addToCart')}
            </motion.button>
            <motion.button
              type="button"
              className="button button--ghost button--premium-outline"
              onClick={handleFavoriteToggle}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiHeart /> {isFavorited ? t('removeFavorite') : t('addToFavorites')}
            </motion.button>
          </div>
          <div className="product-detail-card__details">
            <h2>{t('productDetails')}</h2>
            <ul>
              {productDetails.map((detail) => (
                <motion.li key={detail} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                  {detail}
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="product-detail-card__benefits"><span><FiTruck /> {t('fastDelivery')}</span><span><FiShield /> {t('securePayment')}</span></div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default ProductPage;
