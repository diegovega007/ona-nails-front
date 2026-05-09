import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import clientService       from '../../../services/client_service'
import serviceService      from '../../../services/service_service'
import promotionService    from '../../../services/promotion_service'
import RefreshIcon         from '../../../assets/icons/refreshIcon'
import AppointmentModal    from './AppointmentModal'
import ClientEditModal     from './ClientEditModal'
import ClientAppointmentsModal from './ClientAppointmentsModal'
import ClientRow           from './ClientRow'
import Skeleton            from './Skeleton'
import EmptyState          from './EmptyState'
import PromotionsModule    from '../promotions'
import TablePagination, { useTablePagination, DEFAULT_TABLE_PAGE_SIZE } from '../common/TablePagination'

const REFRESH_INTERVAL_MS = 60_000

// ─── Citas ─────────────────────────────────────────────────────────────────────

const Citas = () => {
  const [clients,      setClients]      = useState([])
  const [services,     setServices]     = useState([])
  const [promotions,   setPromotions]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)
  const [lastUpdated,  setLastUpdated]  = useState(null)
  const [search,       setSearch]       = useState('')
  const [activeTab,    setActiveTab]    = useState('clientes') // 'clientes' | 'promociones'
  const [modal,        setModal]        = useState(null) // { client, appointment? }
  const [editClient,   setEditClient]   = useState(null)
  const [clientApptsModal, setClientApptsModal] = useState(null)

  const intervalRef = useRef(null)

  // ── Carga de datos ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    else         setRefreshing(true)

    const [clientsData, promoData] = await Promise.all([
      clientService.getAll(),
      promotionService.getAll(),
    ])
    setClients(clientsData)
    setPromotions(promoData)
    setLastUpdated(new Date())

    if (initial) setLoading(false)
    else         setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchData(true)
    serviceService.getAll().then(setServices)
    intervalRef.current = setInterval(() => fetchData(false), REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchData])

  // ── Búsqueda local ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const q = search.toLowerCase()
    return clients.filter(c =>
      `${c.name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.cellphone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  }, [clients, search])

  const { page, setPage, paginated } = useTablePagination(
    filtered,
    DEFAULT_TABLE_PAGE_SIZE,
    search,
  )

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaved = (saved) => {
    // Refrescar la lista completa para reflejar el cambio en lealtad y citas
    fetchData(false)
    setModal(null)
  }

  const handleDeleted = () => {
    fetchData(false)
    setModal(null)
  }

  const handleEditAppointment = (client, appointment) => {
    setModal({ client, appointment })
  }

  const handleCreateAppointment = (client) => {
    setModal({ client, appointment: null })
  }

  const handleClientEditSaved = () => {
    fetchData(false)
    setEditClient(null)
  }

  const handleEditAppointmentFromList = (client, appointment) => {
    setClientApptsModal(null)
    handleEditAppointment(client, appointment)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">

      {/* ── Cabecera ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-text-dark">Citas</h1>
          <p className="font-sans text-xs text-text-light mt-0.5">
            Gestión de clientes y sus reservas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="font-sans text-[11px] text-text-light/60 hidden sm:inline">
              Actualizado {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchData(false)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 font-sans text-xs font-medium text-text-light hover:text-primary-dark px-3 py-1.5 rounded-lg hover:bg-primary/8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          {activeTab === 'clientes' && (
            <button
              onClick={() => setModal({ client: null, appointment: null })}
              className="flex items-center gap-2 font-sans text-sm font-medium text-white bg-primary-dark hover:bg-primary-dark/90 px-4 py-2 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva cita
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-neutral-gray">
        {[
          { key: 'clientes',    label: 'Clientes'    },
          { key: 'promociones', label: 'Promociones' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 font-sans text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary-dark text-primary-dark'
                : 'border-transparent text-text-light hover:text-text-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Contenido por tab ── */}
      {activeTab === 'promociones' ? (
        <PromotionsModule promotions={promotions} onRefresh={() => fetchData(false)} />
      ) : (
        <>
          {/* Barra de búsqueda */}
          <div className="relative">
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/60 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="w-full font-sans text-sm text-text-dark bg-white border border-neutral-gray rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-light/50"
              placeholder="Buscar cliente por nombre, teléfono o correo…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Conteo
          {!loading && (
            <p className="font-sans text-xs text-text-light -mt-3">
              {filtered.length === clients.length
                ? `${filtered.length} cliente${filtered.length !== 1 ? 's' : ''}`
                : `${filtered.length} de ${clients.length} clientes`}
            </p>
          )} */}

          {/* Tabla de clientes */}
          <div className="bg-white border border-neutral-gray rounded-2xl overflow-hidden">
            {loading ? (
              <Skeleton rows={6} />
            ) : filtered.length === 0 ? (
              <EmptyState text={search ? 'Sin resultados para la búsqueda' : 'No hay clientes registrados'} />
            ) : (
              <table className="w-full">
                <thead className="hidden sm:table-header-group bg-neutral-light/30 border-b border-neutral-gray/60">
                  <tr>
                    {['Cliente', 'Correo', 'Promoción de fidelidad', 'Citas', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-center font-sans text-[11px] font-semibold tracking-[1.2px] uppercase text-text-light">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-gray/60">
                  {paginated.map(client => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      onEditAppointment={handleEditAppointment}
                      onCreateAppointment={handleCreateAppointment}
                      onEditClient={setEditClient}
                      onOpenAllAppointments={setClientApptsModal}
                    />
                  ))}
                </tbody>
              </table>
            )}

            {!loading && filtered.length > 0 && (
              <TablePagination
                page={page}
                pageSize={DEFAULT_TABLE_PAGE_SIZE}
                totalItems={filtered.length}
                onPageChange={setPage}
                singularLabel="cliente"
                pluralLabel="clientes"
              />
            )}
          </div>
        </>
      )}

      {/* ── Modal de cita ── */}
      {modal !== null && (
        <AppointmentModal
          client={modal.client}
          appointment={modal.appointment}
          services={services}
          promotions={promotions}
          mode={modal.appointment ? 'edit' : 'create'}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}

      {clientApptsModal && (
        <ClientAppointmentsModal
          client={clientApptsModal}
          onClose={() => setClientApptsModal(null)}
          onEditAppointment={handleEditAppointmentFromList}
        />
      )}

      {editClient && (
        <ClientEditModal
          client={editClient}
          onClose={() => setEditClient(null)}
          onSaved={handleClientEditSaved}
        />
      )}
    </div>
  )
}

export default Citas
