import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useTranslation } from '../hooks/useTranslation.js';

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer shell">
        <div className="footer__main">
          <div><p className="footer__brand"><span>V</span> Velora</p><p className="footer__text">{t('footerText')}</p></div>
          <nav className="footer__nav" aria-label={t('navigation')}>
            <Link to="/">{t('menu.home')}</Link>
            <Link to="/favorites"><FiHeart /> {t('menu.favorites')}</Link>
            <Link to="/cart"><FiShoppingBag /> {t('menu.cart')}</Link>
          </nav>
        </div>
        <div className="footer__bottom"><p>{t('copyright', { year })}</p><span>{t('madeWithCare')}</span></div>
      </div>
    </footer>
  );
}

export default memo(Footer);
