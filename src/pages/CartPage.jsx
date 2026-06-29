import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCart, removeFromCart, adjustQuantity } from '../redux/cartSlice.js';
import { useTranslation } from '../hooks/useTranslation.js';
import EmptyState from '../components/EmptyState.jsx';
import { FiArrowRight, FiCheck, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

function CartPage() {
  const cart = useSelector(selectCart);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [ordered, setOrdered] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * (1 - (item.discount || 0) / 100) * item.quantity, 0),
    [cart],
  );
  const oldTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  if (cart.length === 0) {
    return <EmptyState message={t('emptyCart')} />;
  }

  return (
    <section className="page-section shell">
      <div className="section-header">
        <div><span className="eyebrow">{t('yourOrder')}</span><h1>{t('cartTitle')}</h1><p>{t('cartSubtitle', { count: cart.length })}</p></div>
      </div>
      <div className="cart-layout">
        <div className="cart-list">
          {cart.map((item) => {
            const finalPrice = item.price * (1 - (item.discount || 0) / 100);
            return (
              <article key={item.id} className="cart-row">
                <img src={item.image} alt={item.name} loading="lazy" className="cart-row__image" />
                <div className="cart-row__details">
                  <span className="cart-row__category">{item.categoryLabel || item.category}</span>
                  <strong>{item.name}</strong>
                  <div className="cart-row__prices"><b>${finalPrice.toFixed(2)}</b>{item.discount > 0 && <del>${item.price.toFixed(2)}</del>}</div>
                </div>
                <div className="cart-row__controls">
                  <div className="quantity-control" aria-label={t('quantity')}>
                    <button type="button" aria-label={t('decrease')} disabled={item.quantity <= 1} onClick={() => dispatch(adjustQuantity({ id: item.id, quantity: item.quantity - 1 }))}><FiMinus /></button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={t('increase')} onClick={() => dispatch(adjustQuantity({ id: item.id, quantity: item.quantity + 1 }))}><FiPlus /></button>
                  </div>
                  <button type="button" className="remove-button" aria-label={t('remove')} onClick={() => dispatch(removeFromCart(item.id))}><FiTrash2 /></button>
                </div>
              </article>
            );
          })}
        </div>
        <aside className="cart-summary">
          <h2>{t('orderSummary')}</h2>
          <div><span>{t('subtotal')}</span><span>${oldTotal.toFixed(2)}</span></div>
          <div><span>{t('discount')}</span><span className="cart-summary__discount">−${(oldTotal - total).toFixed(2)}</span></div>
          <div className="cart-summary__total"><span>{t('total')}</span><strong>${total.toFixed(2)}</strong></div>
          <button type="button" className={`button button--primary checkout-button ${ordered ? 'is-success' : ''}`} onClick={() => setOrdered(true)}>
            {ordered ? <><FiCheck /> {t('orderAccepted')}</> : <>{t('checkout')} <FiArrowRight /></>}
          </button>
          <small>{t('checkoutNote')}</small>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
