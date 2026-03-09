import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import VertragListe from './pages/VertragListe'
import VertragDetail from './pages/VertragDetail'
import VertragFormular from './pages/VertragFormular'
import Handlungsbedarf from './pages/Handlungsbedarf'
import Reporting from './pages/Reporting'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vertraege" element={<VertragListe />} />
        <Route path="/vertraege/neu" element={<VertragFormular />} />
        <Route path="/vertraege/:id" element={<VertragDetail />} />
        <Route path="/vertraege/:id/bearbeiten" element={<VertragFormular />} />
        <Route path="/handlungsbedarf" element={<Handlungsbedarf />} />
        <Route path="/reporting" element={<Reporting />} />
      </Route>
    </Routes>
  )
}
