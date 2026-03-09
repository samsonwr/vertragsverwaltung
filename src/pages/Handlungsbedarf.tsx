import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Check } from 'lucide-react'
import { api } from '../api'
import { EreignisTypBadge, StatusBadge } from '../components/StatusBadge'
import { formatDate, daysUntil } from '../utils'

export default function Handlungsbedarf() {
  const [ereignisse, setEreignisse] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.getHandlungsbedarf().then(setEreignisse).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleErledigt = async (id: string) => {
    await api.updateEreignis(id, { status: 'erledigt' })
    load()
  }

  if (loading) return <div className="text-center py-12 text-slate-500">Laden...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-slate-800">Handlungsbedarf</h2>
        <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {ereignisse.length} offene Termine
        </span>
      </div>
      <p className="text-sm text-slate-500">
        Alle Verträge mit anstehenden Terminen in den nächsten 90 Tagen.
      </p>

      {ereignisse.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500">Kein akuter Handlungsbedarf. Alles im grünen Bereich!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ereignisse.map(e => {
            const days = daysUntil(e.datum)
            const urgencyClass = days <= 0 ? 'border-l-red-500 bg-red-50/50' : days <= 30 ? 'border-l-orange-400' : 'border-l-yellow-400'
            return (
              <div key={e.id} className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${urgencyClass} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <EreignisTypBadge typ={e.typ} />
                      <StatusBadge status={e.vertrag_status} />
                      <span className={`text-xs font-semibold ${days <= 0 ? 'text-red-600' : days <= 30 ? 'text-orange-600' : 'text-yellow-700'}`}>
                        {days <= 0 ? `${Math.abs(days)} Tage überfällig` : `in ${days} Tagen`}
                      </span>
                    </div>
                    <Link to={`/vertraege/${e.vertrag_id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                      {e.vertrag_titel}
                    </Link>
                    <span className="text-sm text-slate-400 ml-2">({e.vertragsnummer})</span>
                    <div className="flex gap-6 mt-2 text-sm text-slate-500">
                      <span>Termin: <strong>{e.bezeichnung}</strong> am {formatDate(e.datum)}</span>
                      <span>Lieferant: {e.lieferant_name}</span>
                      <span>Owner: {e.verantwortlicher}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleErledigt(e.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 border border-green-300 rounded-lg hover:bg-green-50"
                  >
                    <Check className="w-4 h-4" /> Erledigt
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
