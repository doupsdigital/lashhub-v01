import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('rosae-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div
      className="min-h-screen bg-bg flex font-sans"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${collapsed ? 'md:pl-[64px]' : 'md:pl-[220px]'}
        `}
      >
        <Header setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
