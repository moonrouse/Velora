import { memo, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, toggleFavorite, selectFavorites, selectCart } from '../redux/cartSlice.js';
import LazyImage from './LazyImage.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiStar } from 'react-icons/fi';

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const cart = useSelector(selectCart);
  const { t } = useTranslation();

  const isFavorited = useMemo(
    () => favorites.some((item) => item.id === product.id),
    [favorites, product.id],
  );

  const isInCart = useMemo(
    () => cart.some((item) => item.id === product.id),
    [cart, product.id],
  );

  const handleAddToCart = useCallback(() => {
    if (isInCart) {
      dispatch(removeFromCart(product.id));
      return;
    }
    dispatch(addToCart(product));
  }, [dispatch, product, isInCart]);

  const handleToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite(product));
    // UI updates (heart icon and favorites counter) reflect the change immediately
  }, [dispatch, product]);

  const discountedPrice = useMemo(
    () => product.price * (1 - product.discount / 100),
    [product.price, product.discount],
  );

  return (
    <motion.article className="product-card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} whileHover={{ y: -7 }}>
      <Link to={`/product/${product.id}`} className="product-card__link" aria-label={product.name}>
        <div className="product-card__image">
          {product.discount > 0 && <div className="product-card__badge">-{product.discount}%</div>}
          <div className="product-card__rating"><FiStar /> {Number(product.rating || 0).toFixed(1)}</div>
          <LazyImage src={product.image} alt={product.name} />
        </div>
      </Link>
      <div className="product-card__content">
        <Link to={`/product/${product.id}`} className="product-card__title-link">
          <strong>{product.name}</strong>
          <p className="product-card__category">{product.categoryLabel}</p>
        </Link>
        <div className="product-card__meta">
          <div className="product-card__price-group">
            <span className="product-card__price product-card__price--final">${discountedPrice.toFixed(2)}</span>
            {product.discount > 0 && <span className="product-card__price product-card__price--original">${product.price.toFixed(2)}</span>}
          </div>
          <div className="product-card__actions">
            <button type="button" className={`icon-button button--favorite ${isFavorited ? 'is-active' : ''}`} onClick={handleToggleFavorite} aria-label={isFavorited ? t('removeFavorite') : t('addToFavorites')}>
              {isFavorited ? <AiFillHeart /> : <FiHeart />}
            </button>
            <button type="button" className={`button ${isInCart ? 'button--secondary' : 'button--primary'}`} onClick={handleAddToCart}>
              <FiShoppingBag /> <span>{isInCart ? t('inCart') : t('addToCart')}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(ProductCard);
