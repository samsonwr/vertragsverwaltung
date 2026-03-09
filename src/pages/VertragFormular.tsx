import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { api } from '../api'

export default function VertragFormular() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    titel: '',
    beschreibung: '',
    vertragsart: 'wartung',
    status: 'entwurf',
    kategorie: 'sonstige',
    lieferant_nummer: '',
    lieferant_name: '',
    lieferant_ort: '',
    lieferant_land: 'DE',
    ansprechpartner: '',
    verantwortlicher: '',
    kostenstelle: '',
    innenauftrag: '',
    vertragsbeginn: '',
    vertragsende: '',
    auto_verlaengerung: false,
    verlaengerung_monate: 12,
    kuendigungsfrist_monate: 3,
    vertragsvolumen: 0,
    jaehrliche_kosten: 0,
    waehrung: 'EUR',
    equipment_nummer: '',
    anlagen_nummer: '',
    dokument_referenz: '',
    dokument_version: '1.0',
  })

  useEffect(() => {
    if (isEdit) {
      api.getVertrag(id!).then(v => {
        setForm({
          titel: v.titel || '',
          beschreibung: v.beschreibung || '',
          vertragsart: v.vertragsart,
          status: v.status,
          kategorie: v.kategorie,
          lieferant_nummer: v.lieferant_nummer || '',
          lieferant_name: v.lieferant_name || '',
          lieferant_ort: v.lieferant_ort || '',
          lieferant_land: v.lieferant_land || 'DE',
          ansprechpartner: v.ansprechpartner || '',
          verantwortlicher: v.verantwortlicher || '',
          kostenstelle: v.kostenstelle || '',
          innenauftrag: v.innenauftrag || '',
          vertragsbeginn: v.vertragsbeginn || '',
          vertragsende: v.vertragsende || '',
          auto_verlaengerung: Boolean(v.auto_verlaengerung),
          verlaengerung_monate: v.verlaengerung_monate || 12,
          kuendigungsfrist_monate: v.kuendigungsfrist_monate || 3,
          vertragsvolumen: v.vertragsvolumen || 0,
          jaehrliche_kosten: v.jaehrliche_kosten || 0,
          waehrung: v.waehrung || 'EUR',
          equipment_nummer: v.equipment_nummer || '',
          anlagen_nummer: v.anlagen_nummer || '',
          dokument_referenz: v.dokument_referenz || '',
          dokument_version: v.dokument_version || '1.0',
        })
      }).finally(() => setLoading(false))
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await api.updateVertrag(id!, form)
        navigate(`/vertraege/${id}`)
      } else {
        const created = await api.createVertrag(form)
        navigate(`/vertraege/${created.id}`)
      }
    } catch (err: any) {
      alert('Fehler: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }))

  if (loading) return <div className="text-center py-12 text-slate-500">Laden...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={isEdit ? `/vertraege/${id}` : '/vertraege'} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">
          {isEdit ? 'Vertrag bearbeiten' : 'Neuer Vertrag'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vertragsdaten */}
        <FormSection title="Vertragsdaten">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Titel *" required>
              <input type="text" required value={form.titel} onChange={e => set('titel', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Vertragsart *">
              <select value={form.vertragsart} onChange={e => set('vertragsart', e.target.value)} className="form-input">
                <option value="wartung">Wartung</option>
                <option value="leasing">Leasing</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)} className="form-input">
                <option value="entwurf">Entwurf</option>
                <option value="in_verhandlung">In Verhandlung</option>
                <option value="aktiv">Aktiv</option>
                <option value="gekuendigt">Gekündigt</option>
                <option value="abgelaufen">Abgelaufen</option>
              </select>
            </FormField>
            <FormField label="Kategorie">
              <select value={form.kategorie} onChange={e => set('kategorie', e.target.value)} className="form-input">
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="cloud_service">Cloud Service</option>
                <option value="sonstige">Sonstige</option>
              </select>
            </FormField>
          </div>
          <FormField label="Beschreibung">
            <textarea rows={3} value={form.beschreibung} onChange={e => set('beschreibung', e.target.value)} className="form-input" />
          </FormField>
        </FormSection>

        {/* Geschäftspartner */}
        <FormSection title="Geschäftspartner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Lieferantennummer">
              <input type="text" value={form.lieferant_nummer} onChange={e => set('lieferant_nummer', e.target.value)} placeholder="z.B. 100001" className="form-input" />
            </FormField>
            <FormField label="Lieferantenname">
              <input type="text" value={form.lieferant_name} onChange={e => set('lieferant_name', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Ort">
              <input type="text" value={form.lieferant_ort} onChange={e => set('lieferant_ort', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Land">
              <input type="text" value={form.lieferant_land} onChange={e => set('lieferant_land', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Ansprechpartner">
              <input type="text" value={form.ansprechpartner} onChange={e => set('ansprechpartner', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Verantwortlicher (intern)">
              <input type="text" value={form.verantwortlicher} onChange={e => set('verantwortlicher', e.target.value)} className="form-input" />
            </FormField>
          </div>
        </FormSection>

        {/* Laufzeiten */}
        <FormSection title="Laufzeiten & Konditionen">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Vertragsbeginn *">
              <input type="date" required value={form.vertragsbeginn} onChange={e => set('vertragsbeginn', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Vertragsende *">
              <input type="date" required value={form.vertragsende} onChange={e => set('vertragsende', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Kündigungsfrist (Monate)">
              <input type="number" min={0} value={form.kuendigungsfrist_monate} onChange={e => set('kuendigungsfrist_monate', Number(e.target.value))} className="form-input" />
            </FormField>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.auto_verlaengerung} onChange={e => set('auto_verlaengerung', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-700">Automatische Verlängerung</span>
              </label>
              {form.auto_verlaengerung && (
                <input type="number" min={1} value={form.verlaengerung_monate} onChange={e => set('verlaengerung_monate', Number(e.target.value))} className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Monate" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Vertragsvolumen">
              <input type="number" min={0} step={0.01} value={form.vertragsvolumen} onChange={e => set('vertragsvolumen', Number(e.target.value))} className="form-input" />
            </FormField>
            <FormField label="Jährliche Kosten">
              <input type="number" min={0} step={0.01} value={form.jaehrliche_kosten} onChange={e => set('jaehrliche_kosten', Number(e.target.value))} className="form-input" />
            </FormField>
            <FormField label="Währung">
              <select value={form.waehrung} onChange={e => set('waehrung', e.target.value)} className="form-input">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="CHF">CHF</option>
                <option value="GBP">GBP</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        {/* Zuordnung */}
        <FormSection title="Zuordnung & Referenzen">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Kostenstelle">
              <input type="text" value={form.kostenstelle} onChange={e => set('kostenstelle', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Innenauftrag">
              <input type="text" value={form.innenauftrag} onChange={e => set('innenauftrag', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Equipment-Nummer">
              <input type="text" value={form.equipment_nummer} onChange={e => set('equipment_nummer', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="Anlagenstammsatz">
              <input type="text" value={form.anlagen_nummer} onChange={e => set('anlagen_nummer', e.target.value)} className="form-input" />
            </FormField>
          </div>
        </FormSection>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Link to={isEdit ? `/vertraege/${id}` : '/vertraege'} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">
            Abbrechen
          </Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Speichert...' : isEdit ? 'Speichern' : 'Vertrag anlegen'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function FormField({ label, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
