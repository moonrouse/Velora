import { memo, useCallback, useRef, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiShoppingCart, FiHeart, FiSun, FiMoon, FiGlobe, FiUser, FiMenu, FiX, FiHome, FiChevronRight } from 'react-icons/fi';
import { AppRoutes } from '../constants/routes.js';
import { selectCartCount, selectFavorites } from '../redux/cartSlice.js';
import { setLocale, toggleTheme, selectTheme, selectSearchQuery, setSearchQuery } from '../redux/uiSlice.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { selectCurrentUser } from '../redux/authSlice.js';

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const searchQuery = useSelector(selectSearchQuery);
  const theme = useSelector(selectTheme);
  const favorites = useSelector(selectFavorites);
  const cartCount = useSelector(selectCartCount);
  const currentUser = useSelector(selectCurrentUser);
  const { t, locale } = useTranslation();

  const headerRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 500) setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]);

  const mobileMenu = menuOpen ? (
    <div className="mobile-menu" role="dialog" aria-modal="true" aria-label={t('mobileMenu')}>
      <button className="mobile-menu__overlay" type="button" aria-label={t('closeMenu')} onClick={() => setMenuOpen(false)} />
      <aside className="mobile-menu__panel">
        <div className="mobile-menu__top">
          <div className="logo"><span className="logo__mark">V</span><span>Velora</span></div>
          <button className="icon-button" type="button" aria-label={t('closeMenu')} onClick={() => setMenuOpen(false)}><FiX /></button>
        </div>

        <Link className="mobile-menu__account" to={AppRoutes.account}>
          <span className={`mobile-menu__avatar ${currentUser ? 'is-signed-in' : ''}`}>{currentUser ? currentUser.name.charAt(0).toUpperCase() : <FiUser />}</span>
          <span><strong>{currentUser ? currentUser.name : t('auth.login')}</strong><small>{currentUser ? currentUser.email : t('menuAccountHint')}</small></span>
          <FiChevronRight />
        </Link>

        <nav className="mobile-menu__nav">
          <NavLink to={AppRoutes.home} className={({ isActive }) => (isActive ? 'active' : '')}><FiHome /><span>{t('menu.home')}</span><FiChevronRight /></NavLink>
          <NavLink to={AppRoutes.favorites} className={({ isActive }) => (isActive ? 'active' : '')}><FiHeart /><span>{t('menu.favorites')}</span>{favorites.length > 0 && <b>{favorites.length}</b>}<FiChevronRight /></NavLink>
          <NavLink to={AppRoutes.cart} className={({ isActive }) => (isActive ? 'active' : '')}><FiShoppingCart /><span>{t('menu.cart')}</span>{cartCount > 0 && <b>{cartCount}</b>}<FiChevronRight /></NavLink>
        </nav>

        <div className="mobile-menu__settings">
          <button type="button" onClick={handleThemeToggle}>{theme === 'dark' ? <FiMoon /> : <FiSun />}<span>{t('theme')}</span><strong>{theme === 'dark' ? t('themeDark') : t('themeLight')}</strong></button>
          <button type="button" onClick={handleLocaleToggle}><FiGlobe /><span>{t('language')}</span><strong>{locale.toUpperCase()}</strong></button>
        </div>
        <p className="mobile-menu__note">{t('footerText')}</p>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <header ref={headerRef} className={`site-header sticky-header ${scrolled ? 'header--scrolled' : ''}`} role="banner">
        <div className="header shell">
        <div className="header__brand">
          <Link to={AppRoutes.home} className="logo" aria-label="Velora — главная">
            <span className="logo__mark">V</span>
            <span>Velora</span>
          </Link>
          <nav className="nav-links">
            <NavLink to={AppRoutes.home} className={({ isActive }) => (isActive ? 'active-link' : '')}>{t('menu.home')}</NavLink>
            <NavLink to={AppRoutes.favorites} className={({ isActive }) => (isActive ? 'active-link' : '')}>{t('menu.favorites')}</NavLink>
            <NavLink to={AppRoutes.cart} className={({ isActive }) => (isActive ? 'active-link' : '')}>{t('menu.cart')}</NavLink>
            <NavLink to={AppRoutes.account} className={({ isActive }) => (isActive ? 'active-link' : '')}>{t('menu.account')}</NavLink>
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
          <button className="icon-button" type="button" aria-label={t('toggleTheme')} title={t('toggleTheme')} onClick={handleThemeToggle}>
            {theme === 'dark' ? <FiMoon /> : <FiSun />}
          </button>
          <button className="icon-button language-button" type="button" aria-label={t('toggleLanguage')} title={t('toggleLanguage')} onClick={handleLocaleToggle}>
            <FiGlobe /><span>{locale.toUpperCase()}</span>
          </button>
          <NavLink to={AppRoutes.favorites} className="icon-button badge-button" title={t('menu.favorites')}>
            <FiHeart />
            {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
          </NavLink>
          <NavLink to={AppRoutes.cart} className="icon-button badge-button" title={t('menu.cart')}>
            <FiShoppingCart />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </NavLink>
          <NavLink to={AppRoutes.account} className={`icon-button account-button ${currentUser ? 'is-signed-in' : ''}`} title={t('menu.account')} aria-label={t('menu.account')}>
            {currentUser ? <span>{currentUser.name.charAt(0).toUpperCase()}</span> : <FiUser />}
          </NavLink>
        </div>
        <button className="icon-button mobile-menu-trigger" type="button" aria-label={t('openMenu')} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><FiMenu /></button>
        </div>
      </header>
      {mobileMenu && createPortal(mobileMenu, document.body)}
    </>
  );
};

export default memo(Header);
