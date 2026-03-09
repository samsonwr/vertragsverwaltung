import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Download } from 'lucide-react'
import { api } from '../api'
import { StatusBadge, ArtBadge } from '../components/StatusBadge'
import { formatDate, formatCurrency, daysUntil } from '../utils'

export default function VertragListe() {
  const [vertraege, setVertraege] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const [filter, setFilter] = useState({
    suche: searchParams.get('suche') || '',
    vertragsart: searchParams.get('vertragsart') || '',
    status: searchParams.get('status') || '',
    kategorie: searchParams.get('kategorie') || '',
    ablauf_monate: searchParams.get('ablauf_monate') || '',
  })

  useEffect(() => {
    const params: Record<string, string> = {}
    Object.entries(filter).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params, { replace: true })
    api.getVertraege(params).then(setVertraege).finally(() => setLoading(false))
  }, [filter])

  const handleExport = () => {
    const header = 'Vertragsnummer;Titel;Vertragsart;Status;Lieferant;Beginn;Ende;Jährl. Kosten;Verantwortlicher'
    const rows = vertraege.map(v =>
      `${v.vertragsnummer};${v.titel};${v.vertragsart};${v.status};${v.lieferant_name};${v.vertragsbeginn};${v.vertragsende};${v.jaehrliche_kosten};${v.verantwortlicher}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vertraege_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Verträge</h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link to="/vertraege/neu" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Neuer Vertrag
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Suche..."
              value={filter.suche}
              onChange={e => setFilter(f => ({ ...f, suche: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter.vertragsart}
            onChange={e => setFilter(f => ({ ...f, vertragsart: e.target.value }))}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Arten</option>
            <option value="wartung">Wartung</option>
            <option value="leasing">Leasing</option>
          </select>
          <select
            value={filter.status}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Status</option>
            <option value="aktiv">Aktiv</option>
            <option value="in_verhandlung">In Verhandlung</option>
            <option value="gekuendigt">Gekündigt</option>
            <option value="abgelaufen">Abgelaufen</option>
            <option value="entwurf">Entwurf</option>
          </select>
          <select
            value={filter.kategorie}
            onChange={e => setFilter(f => ({ ...f, kategorie: e.target.value }))}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Kategorien</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="cloud_service">Cloud Service</option>
            <option value="sonstige">Sonstige</option>
          </select>
          <select
            value={filter.ablauf_monate}
            onChange={e => setFilter(f => ({ ...f, ablauf_monate: e.target.value }))}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Laufzeiten</option>
            <option value="3">Ablauf in 3 Monaten</option>
            <option value="6">Ablauf in 6 Monaten</option>
            <option value="12">Ablauf in 12 Monaten</option>
          </select>
        </div>
      </div>

      {/* Tabelle */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Laden...</div>
        ) : vertraege.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Keine Verträge gefunden</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Vertrag</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Lieferant</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Art</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Laufzeit</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Kosten/Jahr</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Nächster Termin</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Owner</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vertraege.map(v => {
                  const nextEvent = v.naechstes_ereignis
                  const nextDays = nextEvent ? daysUntil(nextEvent.datum) : null
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/vertraege/${v.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {v.titel}
                        </Link>
                        <p className="text-xs text-slate-400">{v.vertragsnummer}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{v.lieferant_name}</td>
                      <td className="px-4 py-3"><ArtBadge art={v.vertragsart} /></td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(v.vertragsbeginn)} – {formatDate(v.vertragsende)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{formatCurrency(v.jaehrliche_kosten)}</td>
                      <td className="px-4 py-3">
                        {nextEvent ? (
                          <div>
                            <p className="text-sm text-slate-600">{nextEvent.bezeichnung}</p>
                            <p className={`text-xs ${nextDays !== null && nextDays <= 30 ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                              {formatDate(nextEvent.datum)}
                              {nextDays !== null && ` (${nextDays} Tage)`}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{v.verantwortlicher}</td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {vertraege.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 text-sm text-slate-500">
            {vertraege.length} Vertrag/Verträge | Summe jährl. Kosten: {formatCurrency(vertraege.reduce((s, v) => s + (v.jaehrliche_kosten || 0), 0))}
          </div>
        )}
      </div>
    </div>
  )
}
