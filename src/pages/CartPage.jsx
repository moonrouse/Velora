import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCart, removeFromCart, adjustQuantity } from '../redux/cartSlice.js';
import { useTranslation } from '../hooks/useTranslation.js';
import EmptyState from '../components/EmptyState.jsx';

function CartPage() {
  const cart = useSelector(selectCart);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  if (cart.length === 0) {
    return <EmptyState message={t('emptyCart')} />;
  }

  return (
    <section className="page-section shell">
      <div className="section-header">
        <h2>{t('cartTitle')}</h2>
      </div>
      <div className="cart-list">
        {cart.map((item) => (
          <div key={item.id} className="cart-row">
            <img src={item.image} alt={item.name} loading="lazy" className="cart-row__image" />
            <div className="cart-row__details">
              <strong>{item.name}</strong>
              <p>{item.categoryLabel || item.category}</p>
              <span>${item.price.toFixed(2)}</span>
            </div>
            <div className="cart-row__controls">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => dispatch(adjustQuantity({ id: item.id, quantity: Number(event.target.value) }))}
              />
              <button type="button" className="button button--ghost" onClick={() => { dispatch(removeFromCart(item.id)); }}>
                {t('remove')}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <span>{t('total')}:</span>
        <strong>${total.toFixed(2)}</strong>
        <button type="button" className="button button--primary">{t('checkout')}</button>
      </div>
    </section>
  );
}

export default CartPage;
