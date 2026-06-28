import { memo } from 'react';

function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination">
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={`button button--ghost pagination__button ${page === currentPage ? 'pagination__button--active' : ''}`}
          onClick={() => onChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
}

export default memo(Pagination);
