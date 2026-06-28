import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation.js';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="status-block shell center-screen">
      <h1>{t('notFoundTitle')}</h1>
      <p>{t('notFoundText')}</p>
      <Link to="/" className="button button--primary">
        {t('goHome')}
      </Link>
    </section>
  );
}

export default NotFoundPage;
