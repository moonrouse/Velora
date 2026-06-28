import { memo, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, toggleFavorite, selectFavorites, selectCart } from '../redux/cartSlice.js';
import LazyImage from './LazyImage.jsx';
import { useTranslation } from '../hooks/useTranslation.js';

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
  }, [dispatch, product, isInCart, t]);

  const handleToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite(product));
    // UI updates (heart icon and favorites counter) reflect the change immediately
  }, [dispatch, product, isFavorited, t]);

  const discountedPrice = useMemo(
    () => product.price * (1 - product.discount / 100),
    [product.price, product.discount],
  );

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__link">
        <div className="product-card__image">
          <div className="product-card__badge">-{product.discount}%</div>
          <LazyImage src={product.image} alt={product.name} />
        </div>
        <div className="product-card__content">
          <strong>{product.name}</strong>
          <p className="product-card__category">{product.categoryLabel}</p>
          <div className="product-card__meta">
            <div className="product-card__price-group">
              <span className="product-card__price product-card__price--final">${discountedPrice.toFixed(2)}</span>
              <span className="product-card__price product-card__price--original">${product.price.toFixed(2)}</span>
            </div>
            <div className="product-card__actions">
              <button type="button" className="icon-button button--favorite" onClick={(event) => { event.preventDefault(); event.stopPropagation(); handleToggleFavorite(); }} aria-label={isFavorited ? t('removeFavorite') : t('addToFavorites')}>
                {isFavorited ? <AiFillHeart style={{ color: '#000' }} /> : <FiHeart />}
              </button>
              <button type="button" className={`button ${isInCart ? 'button--secondary' : 'button--primary'}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); handleAddToCart(); }}>
                {isInCart ? t('removeFromCart') : t('addToCart')}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default memo(ProductCard);
