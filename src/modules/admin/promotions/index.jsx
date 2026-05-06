import { useState, useMemo } from 'react'
import promotionService from '../../../services/promotion_service'
import PromotionModal   from './PromotionModal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── PromotionsModule ─────────────────────────────────────────────────────────

const PromotionsModule = ({ promotions, onRefresh }) => {
  const [search, setSearch] = useState('')
  const [modal,  setModal]  = useState(null) // { mode: 'view'|'edit'|'create', promotion? }

  const filtered = useMemo(() => {
    if (!search.trim()) return promotions
    const q = search.toLowerCase()
    return promotions.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.identifier?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }, [promotions, search])

  const handleSaved = async (saved) => {
    onRefresh()
    setModal(null)
  }

  const handleDeleted = () => {
    onRefresh()
    setModal(null)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Barra de búsqueda + botón */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/60 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="w-full font-sans text-sm text-text-dark bg-white border border-neutral-gray rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-light/50"
            placeholder="Buscar promoción…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-2 font-sans text-sm font-medium text-white bg-primary-dark hover:bg-primary-dark/90 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva promoción
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-neutral-gray rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-dark opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <p className="font-serif text-base text-text-dark/40">
              {search ? 'Sin resultados' : 'No hay promociones registradas'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-light/30 border-b border-neutral-gray/60">
              <tr>
                {['Identificador', 'Nombre', 'Descripción', 'Creada', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[11px] font-semibold tracking-[1.2px] uppercase text-text-light">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-gray/60">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-neutral-light/40 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-primary-dark bg-primary/10 px-2.5 py-1 rounded-full">
                      {p.identifier}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-sans text-sm font-medium text-text-dark">{p.name}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell max-w-xs">
                    <p className="font-sans text-xs text-text-dark/70 truncate">{p.description || '—'}</p>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell whitespace-nowrap">
                    <p className="font-sans text-xs text-text-light">{fmtDate(p.created_at)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <div className="relative group">
                        <button
                          onClick={() => setModal({ mode: 'view', promotion: p })}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[11px] text-white bg-text-dark/80 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver detalle
                        </span>
                      </div>
                      <div className="relative group">
                        <button
                          onClick={() => setModal({ mode: 'edit', promotion: p })}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-light hover:text-primary-dark hover:bg-primary/8 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[11px] text-white bg-text-dark/80 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          Editar
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <PromotionModal
          promotion={modal.promotion}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

export default PromotionsModule
