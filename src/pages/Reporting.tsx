import { useEffect, useState } from 'react'
import { BarChart3, Download } from 'lucide-react'
import { api } from '../api'
import { StatusBadge, ArtBadge } from '../components/StatusBadge'
import { formatDate, formatCurrency } from '../utils'

export default function Reporting() {
  const [vertraege, setVertraege] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [groupBy, setGroupBy] = useState<'vertragsart' | 'lieferant' | 'kostenstelle' | 'status'>('vertragsart')
  const [filterEnd, setFilterEnd] = useState('')

  useEffect(() => {
    const params: Record<string, string> = {}
    if (filterEnd) params.ablauf_monate = filterEnd
    Promise.all([
      api.getVertraege(params),
      api.getDashboardStats(),
    ]).then(([v, s]) => { setVertraege(v); setStats(s) }).finally(() => setLoading(false))
  }, [filterEnd])

  const grouped = vertraege.reduce((acc: Record<string, any[]>, v) => {
    const key = v[groupBy === 'lieferant' ? 'lieferant_name' : groupBy] || 'Unbekannt'
    if (!acc[key]) acc[key] = []
    acc[key].push(v)
    return acc
  }, {})

  const handleExport = () => {
    const header = 'Vertragsnummer;Titel;Art;Status;Lieferant;Kostenstelle;Beginn;Ende;Jährl. Kosten;Volumen;Owner'
    const rows = vertraege.map(v =>
      `${v.vertragsnummer};${v.titel};${v.vertragsart};${v.status};${v.lieferant_name};${v.kostenstelle};${v.vertragsbeginn};${v.vertragsende};${v.jaehrliche_kosten};${v.vertragsvolumen};${v.verantwortlicher}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporting_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-12 text-slate-500">Laden...</div>

  const labels: Record<string, Record<string, string>> = {
    vertragsart: { wartung: 'Wartung', leasing: 'Leasing' },
    status: { aktiv: 'Aktiv', gekuendigt: 'Gekündigt', abgelaufen: 'Abgelaufen', in_verhandlung: 'In Verhandlung', entwurf: 'Entwurf' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Reporting</h2>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Kennzahlen */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI label="Aktive Wartungsverträge" value={stats.wartungsvertraege} />
          <KPI label="Aktive Leasingverträge" value={stats.leasingvertraege} />
          <KPI label="Jährl. Kosten gesamt" value={formatCurrency(stats.jaehrliche_kosten_gesamt)} />
          <KPI label="Handlungsbedarf" value={stats.handlungsbedarf} />
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gruppierung</label>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value as any)} className="border border-slate-300 rounded-lg text-sm px-3 py-2">
            <option value="vertragsart">Vertragsart</option>
            <option value="lieferant">Lieferant</option>
            <option value="kostenstelle">Kostenstelle</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Laufzeitende</label>
          <select value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="border border-slate-300 rounded-lg text-sm px-3 py-2">
            <option value="">Alle</option>
            <option value="3">Nächste 3 Monate</option>
            <option value="6">Nächste 6 Monate</option>
            <option value="12">Nächste 12 Monate</option>
          </select>
        </div>
      </div>

      {/* Gruppierte Tabelle */}
      {Object.entries(grouped).map(([key, items]) => (
        <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-700">
                {(labels[groupBy] || {})[key] || key}
              </h3>
              <span className="text-xs text-slate-400">({items.length} Verträge)</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {formatCurrency(items.reduce((s: number, v: any) => s + (v.jaehrliche_kosten || 0), 0))} / Jahr
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Vertrag</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Lieferant</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Laufzeit</th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-2">Jährl. Kosten</th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-2">Volumen</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((v: any) => (
                <tr key={v.id}>
                  <td className="px-4 py-2 text-sm text-slate-700">{v.titel}</td>
                  <td className="px-4 py-2 text-sm text-slate-500">{v.lieferant_name}</td>
                  <td className="px-4 py-2 text-sm text-slate-500">{formatDate(v.vertragsbeginn)} – {formatDate(v.vertragsende)}</td>
                  <td className="px-4 py-2 text-sm text-slate-700 text-right font-medium">{formatCurrency(v.jaehrliche_kosten)}</td>
                  <td className="px-4 py-2 text-sm text-slate-500 text-right">{formatCurrency(v.vertragsvolumen)}</td>
                  <td className="px-4 py-2"><StatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Kosten nach Lieferant */}
      {stats && stats.kosten_nach_lieferant.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Summe jährlicher Kosten nach Lieferant</h3>
          <div className="space-y-2">
            {stats.kosten_nach_lieferant.map((item: any) => {
              const pct = stats.jaehrliche_kosten_gesamt > 0 ? (item.summe / stats.jaehrliche_kosten_gesamt) * 100 : 0
              return (
                <div key={item.lieferant} className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-64 truncate">{item.lieferant}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-32 text-right">{formatCurrency(item.summe)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Kosten nach Kostenstelle */}
      {stats && stats.kosten_nach_kostenstelle.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Vertragsvolumen pro Kostenstelle</h3>
          <div className="space-y-2">
            {stats.kosten_nach_kostenstelle.map((item: any) => {
              const pct = stats.jaehrliche_kosten_gesamt > 0 ? (item.summe / stats.jaehrliche_kosten_gesamt) * 100 : 0
              return (
                <div key={item.kostenstelle} className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-64 truncate">{item.kostenstelle}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-32 text-right">{formatCurrency(item.summe)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  )
}
