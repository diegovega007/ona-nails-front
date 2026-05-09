import { useState, useMemo, useEffect } from 'react'

export const DEFAULT_TABLE_PAGE_SIZE = 10

/**
 * @param {unknown[]} items
 * @param {number} pageSize
 * @param {string|number} resetKey — al cambiar, vuelve a la página 1 (p. ej. `${search}|${filter}`)
 */
export function useTablePagination(items, pageSize, resetKey) {
  const [page, setPage] = useState(1)
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  useEffect(() => {
    setPage(1)
  }, [resetKey])

  useEffect(() => {
    setPage(p => (p > totalPages ? totalPages : p))
  }, [totalPages])

  return { page, setPage, totalPages, paginated }
}

/**
 * Barra de paginación para tablas admin (cliente).
 */
export default function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  singularLabel,
  pluralLabel,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-neutral-gray/60 bg-neutral-light/30">
      <p className="font-sans text-xs text-text-light order-2 sm:order-1">
        {totalItems <= pageSize ? (
          <>
            {totalItems} {totalItems === 1 ? singularLabel : pluralLabel}
          </>
        ) : (
          <>
            Mostrando{' '}
            <span className="font-medium text-text-dark">{start}</span>
            –
            <span className="font-medium text-text-dark">{end}</span>
            {' '}de {totalItems}
          </>
        )}
      </p>
      <div className="flex items-center gap-2 order-1 sm:order-2 justify-end">
        <span className="font-sans text-xs text-text-light mr-1">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="font-sans text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-gray bg-white text-text-dark hover:bg-neutral-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="font-sans text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-gray bg-white text-text-dark hover:bg-neutral-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
