import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Scans from './pages/Scans';
import Findings from './pages/Findings';
import FindingDetail from './pages/FindingDetail';
import UserProfile from './pages/UserProfile';
import Admin from './pages/Admin';
import ApiDocs from './pages/ApiDocs';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/scans" element={<Scans />} />
        <Route path="/findings" element={<Findings />} />
        <Route path="/findings/:id" element={<FindingDetail />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/docs" element={<ApiDocs />} />
      </Route>
    </Routes>
  );
}
