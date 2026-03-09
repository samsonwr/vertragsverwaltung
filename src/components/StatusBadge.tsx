const statusConfig: Record<string, { label: string; className: string }> = {
  entwurf: { label: 'Entwurf', className: 'bg-slate-100 text-slate-700' },
  in_verhandlung: { label: 'In Verhandlung', className: 'bg-yellow-100 text-yellow-800' },
  aktiv: { label: 'Aktiv', className: 'bg-green-100 text-green-800' },
  gekuendigt: { label: 'Gekündigt', className: 'bg-red-100 text-red-800' },
  abgelaufen: { label: 'Abgelaufen', className: 'bg-slate-200 text-slate-600' },
}

const ereignisStatusConfig: Record<string, { label: string; className: string }> = {
  offen: { label: 'Offen', className: 'bg-orange-100 text-orange-800' },
  erledigt: { label: 'Erledigt', className: 'bg-green-100 text-green-800' },
  ignoriert: { label: 'Ignoriert', className: 'bg-slate-100 text-slate-600' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-slate-100 text-slate-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function EreignisStatusBadge({ status }: { status: string }) {
  const config = ereignisStatusConfig[status] || { label: status, className: 'bg-slate-100 text-slate-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

const artConfig: Record<string, { label: string; className: string }> = {
  wartung: { label: 'Wartung', className: 'bg-blue-100 text-blue-800' },
  leasing: { label: 'Leasing', className: 'bg-purple-100 text-purple-800' },
}

export function ArtBadge({ art }: { art: string }) {
  const config = artConfig[art] || { label: art, className: 'bg-slate-100 text-slate-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

const typConfig: Record<string, { label: string; className: string }> = {
  kuendigungsfrist: { label: 'Kündigungsfrist', className: 'bg-red-100 text-red-800' },
  laufzeitende: { label: 'Laufzeitende', className: 'bg-orange-100 text-orange-800' },
  verlaengerung: { label: 'Verlängerung', className: 'bg-blue-100 text-blue-800' },
  preisanpassung: { label: 'Preisanpassung', className: 'bg-yellow-100 text-yellow-800' },
  review: { label: 'Review', className: 'bg-teal-100 text-teal-800' },
  ende_testphase: { label: 'Ende Testphase', className: 'bg-purple-100 text-purple-800' },
  sonstige: { label: 'Sonstige', className: 'bg-slate-100 text-slate-700' },
}

export function EreignisTypBadge({ typ }: { typ: string }) {
  const config = typConfig[typ] || { label: typ, className: 'bg-slate-100 text-slate-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
