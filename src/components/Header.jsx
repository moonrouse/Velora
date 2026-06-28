import { memo, useCallback, useRef, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiShoppingCart, FiHeart, FiSun, FiMoon, FiGlobe } from 'react-icons/fi';
import { AppRoutes } from '../constants/routes.js';
import { selectCartCount, selectFavorites } from '../redux/cartSlice.js';
import { setLocale, toggleTheme, selectTheme, selectSearchQuery, setSearchQuery } from '../redux/uiSlice.js';
import { useTranslation } from '../hooks/useTranslation.js';

const Header = () => {
  const dispatch = useDispatch();
  const searchQuery = useSelector(selectSearchQuery);
  const theme = useSelector(selectTheme);
  const favorites = useSelector(selectFavorites);
  const cartCount = useSelector(selectCartCount);
  const { t, locale } = useTranslation();

  const headerRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  const onSearchChange = useCallback((event) => {
    dispatch(setSearchQuery(event.target.value));
  }, [dispatch]);

  const handleThemeToggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const handleLocaleToggle = useCallback(() => {
    dispatch(setLocale(locale === 'ru' ? 'en' : 'ru'));
  }, [dispatch, locale]);

  useEffect(() => {
    const headerNode = headerRef.current;
    if (!headerNode) return undefined;

    const setHeaderHeightVar = () => {
      const h = headerNode.offsetHeight || 88;
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    };

    setHeaderHeightVar();
    const onResize = () => setHeaderHeightVar();
    window.addEventListener('resize', onResize);

    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const should = window.scrollY > 20;
        setScrolled(should);
        setHeaderHeightVar();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [headerRef]);

  return (
    <header
      ref={headerRef}
      className={`site-header sticky-header ${scrolled ? 'header--scrolled' : ''}`}
      role="banner"
    >
      <div className="header shell">
        <div className="header__brand">
          <span className="logo">Velora</span>
          <nav className="nav-links">
            <NavLink to={AppRoutes.home} className={({ isActive }) => (isActive ? 'active-link' : '')}>{t('menu.home')}</NavLink>
            <NavLink to={AppRoutes.favorites} className={({ isActive }) => (isActive ? 'active-link' : '')}>{t('menu.favorites')}</NavLink>
            <NavLink to={AppRoutes.cart} className={({ isActive }) => (isActive ? 'active-link' : '')}>{t('menu.cart')}</NavLink>
          </nav>
        </div>

        <div className="header__search">
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={t('search')}
            aria-label={t('search')}
          />
        </div>

        <div className="header__actions">
          <button className="icon-button" type="button" title={t('toggleTheme')} onClick={handleThemeToggle}>
            {theme === 'dark' ? <FiMoon /> : <FiSun />}
          </button>
          <button className="icon-button" type="button" title={t('toggleLanguage')} onClick={handleLocaleToggle}>
            <FiGlobe />
          </button>
          <NavLink to={AppRoutes.favorites} className="icon-button badge-button" title={t('menu.favorites')}>
            <FiHeart />
            {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
          </NavLink>
          <NavLink to={AppRoutes.cart} className="icon-button badge-button" title={t('menu.cart')}>
            <FiShoppingCart />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
