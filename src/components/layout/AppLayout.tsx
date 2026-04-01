import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { AivaProvider } from '../aiva/AivaContext'
import AivaTrigger from '../aiva/AivaTrigger'
import AivaPanel from '../aiva/AivaPanel'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(
    () => sessionStorage.getItem('sidebar_collapsed') === 'true'
  )

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev
      sessionStorage.setItem('sidebar_collapsed', String(next))
      return next
    })
  }

  return (
    <AivaProvider>
      <div className="flex h-screen bg-bg-primary overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
        <main
          className={`flex-1 p-6 overflow-y-auto transition-[margin] duration-200 ${
            collapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <Outlet />
        </main>
      </div>
      <AivaTrigger />
      <AivaPanel />
    </AivaProvider>
  )
}
