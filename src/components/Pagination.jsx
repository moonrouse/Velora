import { memo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from '../hooks/useTranslation.js';

const getPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((page) => page > 0 && page <= totalPages).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push(`ellipsis-${page}`);
    items.push(page);
  });
  return items;
};

function Pagination({ currentPage, totalPages, onChange }) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const items = getPageItems(currentPage, totalPages);

  const changePage = (page) => {
    onChange(page);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="pagination" aria-label={t('pagination')}>
      <button type="button" className="pagination__arrow" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)} aria-label={t('previousPage')}><FiChevronLeft /></button>
      {items.map((item) => typeof item === 'string' ? (
        <span className="pagination__ellipsis" key={item} aria-hidden="true">…</span>
      ) : (
        <button
          key={item}
          type="button"
          className={`pagination__button ${item === currentPage ? 'pagination__button--active' : ''} ${Math.abs(item - currentPage) <= 1 ? 'pagination__item--near' : ''} ${(item === 1 || item === totalPages) ? 'pagination__item--outer' : ''}`}
          onClick={() => changePage(item)}
          aria-current={item === currentPage ? 'page' : undefined}
          aria-label={`${t('page')} ${item}`}
        >
          {item}
        </button>
      ))}
      <button type="button" className="pagination__arrow" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)} aria-label={t('nextPage')}><FiChevronRight /></button>
      <span className="pagination__summary">{currentPage} / {totalPages}</span>
    </nav>
  );
}

export default memo(Pagination);
