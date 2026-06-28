import { memo } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'IG' },
  { label: 'Facebook', href: 'https://facebook.com', icon: 'FB' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'LN' },
];

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer shell footer--minimal">
      <p className="footer__brand">Velora</p>
      <p className="footer__note">{t('copyright', { year })}</p>
    </footer>
  );
}

export default memo(Footer);
