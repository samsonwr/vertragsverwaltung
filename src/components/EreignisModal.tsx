import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  ereignis?: any
  onSave: (data: any) => void
  onClose: () => void
}

export default function EreignisModal({ ereignis, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    typ: ereignis?.typ || 'review',
    bezeichnung: ereignis?.bezeichnung || '',
    datum: ereignis?.datum || '',
    vorlauf_tage: ereignis?.vorlauf_tage || 30,
    empfaenger: ereignis?.empfaenger || '',
    status: ereignis?.status || 'offen',
    notizen: ereignis?.notizen || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">
            {ereignis ? 'Termin bearbeiten' : 'Neuer Termin'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Typ</label>
            <select
              value={form.typ}
              onChange={e => setForm(f => ({ ...f, typ: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="kuendigungsfrist">Kündigungsfrist</option>
              <option value="laufzeitende">Laufzeitende</option>
              <option value="verlaengerung">Verlängerung</option>
              <option value="preisanpassung">Preisanpassung</option>
              <option value="review">Review</option>
              <option value="ende_testphase">Ende Testphase</option>
              <option value="sonstige">Sonstige</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bezeichnung</label>
            <input
              type="text"
              required
              value={form.bezeichnung}
              onChange={e => setForm(f => ({ ...f, bezeichnung: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Datum</label>
              <input
                type="date"
                required
                value={form.datum}
                onChange={e => setForm(f => ({ ...f, datum: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vorlauf (Tage)</label>
              <input
                type="number"
                min={0}
                value={form.vorlauf_tage}
                onChange={e => setForm(f => ({ ...f, vorlauf_tage: Number(e.target.value) }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empfänger</label>
              <input
                type="text"
                value={form.empfaenger}
                onChange={e => setForm(f => ({ ...f, empfaenger: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="offen">Offen</option>
                <option value="erledigt">Erledigt</option>
                <option value="ignoriert">Ignoriert</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notizen</label>
            <textarea
              rows={2}
              value={form.notizen}
              onChange={e => setForm(f => ({ ...f, notizen: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">
              Abbrechen
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
