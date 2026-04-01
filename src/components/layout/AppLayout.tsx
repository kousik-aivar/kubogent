import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { AivaProvider } from '../aiva/AivaContext'
import AivaTrigger from '../aiva/AivaTrigger'
import AivaPanel from '../aiva/AivaPanel'

export default function AppLayout() {
  return (
    <AivaProvider>
      <div className="flex min-h-screen bg-bg-primary">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <AivaTrigger />
      <AivaPanel />
    </AivaProvider>
  )
}
