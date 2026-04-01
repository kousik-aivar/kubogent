import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ClustersListPage from './pages/clusters/ClustersListPage'
import ClusterDetailPage from './pages/clusters/ClusterDetailPage'
import NewClusterWizard from './pages/clusters/NewClusterWizard'
import ModelsListPage from './pages/aiops/models/ModelsListPage'
import ModelDetailPage from './pages/aiops/models/ModelDetailPage'
import DeploymentsListPage from './pages/aiops/deployments/DeploymentsListPage'
import DeploymentDetailPage from './pages/aiops/deployments/DeploymentDetailPage'
import NewDeploymentWizard from './pages/aiops/deployments/NewDeploymentWizard'
import PipelinesListPage from './pages/aiops/pipelines/PipelinesListPage'
import PipelineDesignerPage from './pages/aiops/pipelines/PipelineDesignerPage'
import CreatePipelinePage from './pages/aiops/pipelines/CreatePipelinePage'
import StudioPage from './pages/ml-engineering/StudioPage'
import TerminalPage from './pages/terminal/TerminalPage'
import SettingsPage from './pages/settings/SettingsPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('kubogent_auth') === 'true'
  )

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clusters" element={<ClustersListPage />} />
        <Route path="/clusters/new" element={<NewClusterWizard />} />
        <Route path="/clusters/:id" element={<ClusterDetailPage />} />
        <Route path="/aiops/models" element={<ModelsListPage />} />
        <Route path="/aiops/models/:id" element={<ModelDetailPage />} />
        <Route path="/aiops/inference" element={<DeploymentsListPage />} />
        <Route path="/aiops/inference/new" element={<NewDeploymentWizard />} />
        <Route path="/aiops/inference/:id" element={<DeploymentDetailPage />} />
        {/* Legacy redirect for old deployment URLs */}
        <Route path="/aiops/deployments" element={<Navigate to="/aiops/inference" replace />} />
        <Route path="/aiops/deployments/:id" element={<Navigate to="/aiops/inference" replace />} />
        <Route path="/aiops/pipelines" element={<PipelinesListPage />} />
        <Route path="/aiops/pipelines/create" element={<CreatePipelinePage />} />
        <Route path="/aiops/pipelines/:id" element={<PipelineDesignerPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/ml-engineering" element={<Navigate to="/studio" replace />} />
        <Route path="/terminal" element={<TerminalPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
