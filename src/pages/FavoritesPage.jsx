import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavorites, selectCart, addToCart, toggleFavorite } from '../redux/cartSlice.js';
import { useTranslation } from '../hooks/useTranslation.js';
import EmptyState from '../components/EmptyState.jsx';

function FavoritesPage() {
  const favorites = useSelector(selectFavorites);
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const { t } = useTranslation();

  // Exclude items already in cart from the favorites list
  const favoriteItems = useMemo(() => favorites.filter((f) => !cart.some((c) => c.id === f.id)), [favorites, cart]);

  if (favoriteItems.length === 0) {
    return <EmptyState message={t('emptyFavorites')} />;
  }

  return (
    <section className="page-section shell">
      <div className="section-header">
        <h2>{t('favoritesTitle')}</h2>
      </div>
      <div className="favorites-grid">
        {favoriteItems.map((item) => (
          <article key={item.id} className="favorite-card">
            <img src={item.image} alt={item.name} loading="lazy" className="favorite-card__image" />
            <div className="favorite-card__body">
              <strong>{item.name}</strong>
              <span>${item.price.toFixed(2)}</span>
              <div className="favorite-card__controls">
                <button type="button" className="button button--ghost" onClick={() => { dispatch(toggleFavorite(item)); }}>
                  {t('removeFavorite')}
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => {
                    // Move item to cart and remove from favorites
                    dispatch(addToCart(item));
                    dispatch(toggleFavorite(item));
                  }}
                >
                  {t('addToCart')}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FavoritesPage;
