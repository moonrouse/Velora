import { useSelector } from 'react-redux';
import { selectFavorites } from '../redux/cartSlice.js';
import { useTranslation } from '../hooks/useTranslation.js';
import EmptyState from '../components/EmptyState.jsx';
import ProductCard from '../components/ProductCard.jsx';

function FavoritesPage() {
  const favorites = useSelector(selectFavorites);
  const { t } = useTranslation();

  if (favorites.length === 0) {
    return <EmptyState message={t('emptyFavorites')} />;
  }

  return (
    <section className="page-section shell">
      <div className="section-header">
        <div><span className="eyebrow">{t('saved')}</span><h1>{t('favoritesTitle')}</h1><p>{t('favoritesSubtitle', { count: favorites.length })}</p></div>
      </div>
      <div className="product-grid favorites-grid">
        {favorites.map((item) => <ProductCard key={item.id} product={item} />)}
      </div>
    </section>
  );
}

export default FavoritesPage;
