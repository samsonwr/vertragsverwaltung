import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Plus, Trash2, Calendar, History, FileText, Check, X } from 'lucide-react'
import { api } from '../api'
import { StatusBadge, ArtBadge, EreignisTypBadge, EreignisStatusBadge } from '../components/StatusBadge'
import { formatDate, formatCurrency, formatDateTime, daysUntil } from '../utils'
import EreignisModal from '../components/EreignisModal'

type Tab = 'stammdaten' | 'termine' | 'dokumente' | 'historie'

export default function VertragDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vertrag, setVertrag] = useState<any>(null)
  const [historie, setHistorie] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('stammdaten')
  const [showEreignisModal, setShowEreignisModal] = useState(false)
  const [editEreignis, setEditEreignis] = useState<any>(null)

  const load = () => {
    Promise.all([
      api.getVertrag(id!),
      api.getHistorie({ vertrag_id: id! }),
    ]).then(([v, h]) => {
      setVertrag(v)
      setHistorie(h)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    if (!confirm('Vertrag wirklich löschen?')) return
    await api.deleteVertrag(id!)
    navigate('/vertraege')
  }

  const handleEreignisSave = async (data: any) => {
    if (editEreignis) {
      await api.updateEreignis(editEreignis.id, data)
    } else {
      await api.createEreignis({ ...data, vertrag_id: id })
    }
    setShowEreignisModal(false)
    setEditEreignis(null)
    load()
  }

  const handleEreignisStatus = async (eid: string, status: string) => {
    await api.updateEreignis(eid, { status })
    load()
  }

  const handleDeleteEreignis = async (eid: string) => {
    if (!confirm('Termin wirklich löschen?')) return
    await api.deleteEreignis(eid)
    load()
  }

  if (loading) return <div className="text-center py-12 text-slate-500">Laden...</div>
  if (!vertrag) return <div className="text-center py-12 text-red-500">Vertrag nicht gefunden</div>

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'stammdaten', label: 'Stammdaten', icon: FileText },
    { key: 'termine', label: 'Termine / Fristen', icon: Calendar },
    { key: 'historie', label: 'Historie', icon: History },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link to="/vertraege" className="mt-1 text-slate-400 hover:text-slate-600"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">{vertrag.titel}</h2>
              <StatusBadge status={vertrag.status} />
              <ArtBadge art={vertrag.vertragsart} />
            </div>
            <p className="text-sm text-slate-500 mt-1">{vertrag.vertragsnummer} | {vertrag.lieferant_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/vertraege/${id}/bearbeiten`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Edit className="w-4 h-4" /> Bearbeiten
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium">
            <Trash2 className="w-4 h-4" /> Löschen
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tab === 'stammdaten' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Vertragsdaten">
            <Field label="Vertragsnummer" value={vertrag.vertragsnummer} />
            <Field label="Titel" value={vertrag.titel} />
            <Field label="Beschreibung" value={vertrag.beschreibung} />
            <Field label="Kategorie" value={{ hardware: 'Hardware', software: 'Software', cloud_service: 'Cloud Service', sonstige: 'Sonstige' }[vertrag.kategorie as string] || vertrag.kategorie} />
          </Section>
          <Section title="Geschäftspartner">
            <Field label="Lieferant" value={`${vertrag.lieferant_name} (${vertrag.lieferant_nummer})`} />
            <Field label="Ort" value={`${vertrag.lieferant_ort}, ${vertrag.lieferant_land}`} />
            <Field label="Ansprechpartner" value={vertrag.ansprechpartner} />
            <Field label="Verantwortlicher (intern)" value={vertrag.verantwortlicher} />
          </Section>
          <Section title="Laufzeiten & Konditionen">
            <Field label="Vertragsbeginn" value={formatDate(vertrag.vertragsbeginn)} />
            <Field label="Vertragsende" value={formatDate(vertrag.vertragsende)} />
            <Field label="Auto-Verlängerung" value={vertrag.auto_verlaengerung ? `Ja (${vertrag.verlaengerung_monate} Monate)` : 'Nein'} />
            <Field label="Kündigungsfrist" value={`${vertrag.kuendigungsfrist_monate} Monate zum Laufzeitende`} />
            <Field label="Vertragsvolumen" value={formatCurrency(vertrag.vertragsvolumen, vertrag.waehrung)} />
            <Field label="Jährliche Kosten" value={formatCurrency(vertrag.jaehrliche_kosten, vertrag.waehrung)} />
          </Section>
          <Section title="Zuordnung & Referenzen">
            <Field label="Kostenstelle" value={vertrag.kostenstelle} />
            <Field label="Innenauftrag" value={vertrag.innenauftrag} />
            <Field label="Equipment-Nr." value={vertrag.equipment_nummer} />
            <Field label="Anlagen-Nr." value={vertrag.anlagen_nummer} />
            <Field label="Dokument" value={vertrag.dokument_referenz || '–'} />
            <Field label="Dok.-Version" value={vertrag.dokument_version} />
          </Section>
        </div>
      )}

      {tab === 'termine' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditEreignis(null); setShowEreignisModal(true) }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Termin hinzufügen
            </button>
          </div>
          {vertrag.ereignisse?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Keine Termine vorhanden</div>
          ) : (
            <div className="space-y-3">
              {vertrag.ereignisse?.map((e: any) => {
                const days = daysUntil(e.datum)
                return (
                  <div key={e.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full ${days <= 0 ? 'bg-red-500' : days <= 30 ? 'bg-orange-400' : days <= 90 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <EreignisTypBadge typ={e.typ} />
                          <span className="text-sm font-medium text-slate-800">{e.bezeichnung}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {formatDate(e.datum)} ({days > 0 ? `in ${days} Tagen` : days === 0 ? 'Heute' : `${Math.abs(days)} Tage überfällig`})
                          {e.vorlauf_tage > 0 && ` | Erinnerung: ${e.vorlauf_tage} Tage vorher`}
                        </p>
                        {e.notizen && <p className="text-xs text-slate-400 mt-1">{e.notizen}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <EreignisStatusBadge status={e.status} />
                      {e.status === 'offen' && (
                        <button onClick={() => handleEreignisStatus(e.id, 'erledigt')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Erledigt">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => { setEditEreignis(e); setShowEreignisModal(true) }} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded" title="Bearbeiten">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteEreignis(e.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded" title="Löschen">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'historie' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {historie.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Keine Historie vorhanden</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {historie.map(h => (
                <div key={h.id} className="px-4 py-3 flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-slate-700">{h.benutzer}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-400">{formatDateTime(h.zeitpunkt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {h.aktion === 'erstellt' && h.neuer_wert}
                      {h.aktion === 'geaendert' && `${h.feld}: "${h.alter_wert}" → "${h.neuer_wert}"`}
                      {h.aktion === 'ereignis_erstellt' && `Termin erstellt: ${h.neuer_wert}`}
                      {h.aktion === 'ereignis_geaendert' && `Termin geändert: ${h.neuer_wert}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showEreignisModal && (
        <EreignisModal
          ereignis={editEreignis}
          onSave={handleEreignisSave}
          onClose={() => { setShowEreignisModal(false); setEditEreignis(null) }}
        />
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right max-w-[60%]">{value || '–'}</span>
    </div>
  )
}
