import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Wrench, Monitor, AlertTriangle, TrendingUp, Plus } from 'lucide-react'
import { api } from '../api'
import { formatCurrency } from '../utils'
import type { DashboardStats } from '@shared/types'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboardStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-slate-500">Laden...</div>
  if (!stats) return <div className="text-center py-12 text-red-500">Fehler beim Laden</div>

  const kacheln = [
    { label: 'Aktive Verträge', value: stats.aktive_vertraege, icon: FileText, color: 'bg-blue-500', link: '/vertraege?status=aktiv' },
    { label: 'Wartungsverträge', value: stats.wartungsvertraege, icon: Wrench, color: 'bg-teal-500', link: '/vertraege?vertragsart=wartung' },
    { label: 'Leasingverträge', value: stats.leasingvertraege, icon: Monitor, color: 'bg-purple-500', link: '/vertraege?vertragsart=leasing' },
    { label: 'Handlungsbedarf', value: stats.handlungsbedarf, icon: AlertTriangle, color: 'bg-orange-500', link: '/handlungsbedarf' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <Link
          to="/vertraege/neu"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Neuer Vertrag
        </Link>
      </div>

      {/* KPI Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kacheln.map(k => (
          <Link key={k.label} to={k.link} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{k.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{k.value}</p>
              </div>
              <div className={`${k.color} rounded-lg p-3`}>
                <k.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Jährliche Kosten */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Jährliche Kosten gesamt</h3>
        </div>
        <p className="text-3xl font-bold text-slate-800">{formatCurrency(stats.jaehrliche_kosten_gesamt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kosten nach Lieferant */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Kosten nach Lieferant</h3>
          <div className="space-y-3">
            {stats.kosten_nach_lieferant.map((item: any) => (
              <div key={item.lieferant} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 truncate mr-4">{item.lieferant}</span>
                <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{formatCurrency(item.summe)}</span>
              </div>
            ))}
            {stats.kosten_nach_lieferant.length === 0 && (
              <p className="text-sm text-slate-400">Keine Daten</p>
            )}
          </div>
        </div>

        {/* Verträge nach Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Verträge nach Status</h3>
          <div className="space-y-3">
            {stats.vertraege_nach_status.map((item: any) => {
              const labels: Record<string, string> = {
                aktiv: 'Aktiv', gekuendigt: 'Gekündigt', abgelaufen: 'Abgelaufen',
                in_verhandlung: 'In Verhandlung', entwurf: 'Entwurf',
              }
              const colors: Record<string, string> = {
                aktiv: 'bg-green-500', gekuendigt: 'bg-red-500', abgelaufen: 'bg-slate-400',
                in_verhandlung: 'bg-yellow-500', entwurf: 'bg-slate-300',
              }
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colors[item.status] || 'bg-slate-300'}`} />
                  <span className="text-sm text-slate-600 flex-1">{labels[item.status] || item.status}</span>
                  <span className="text-sm font-semibold text-slate-800">{item.anzahl}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
