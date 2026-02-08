"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Megaphone 
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get the tenant ID from the URL
  const tenantId = searchParams.get('id');

  const handleLogout = () => {
    // Navigate back to the landing page
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#4B0082] text-white p-6 flex flex-col h-screen sticky top-0">
        <h2 className="text-2xl font-bold mb-10">Campaign Manager</h2>
        
        <nav className="flex-1 space-y-4">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active />
          <NavItem icon={<BarChart3 size={20}/>} label="Analytics" />
          <NavItem icon={<Users size={20}/>} label="Campaigns" />
          <NavItem icon={<Settings size={20}/>} label="Settings" />
        </nav>

        {/* LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-indigo-200 hover:text-white transition-colors pt-6 border-t border-indigo-800 w-full mt-auto mb-4"
        >
          <LogOut size={20} />
          <span className="font-semibold text-lg">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tenant Dashboard</h1>
            <p className="text-gray-500">
              Managing data for Tenant ID: 
              <span className="ml-2 font-mono text-[#5D00B1] bg-indigo-50 px-2 py-1 rounded-md text-sm border border-indigo-100">
                {tenantId || 'No ID detected'}
              </span>
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-[#5D00B1] font-bold shadow-sm">
            JD
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Active Campaigns" value="12" />
          <StatCard title="Total Leads" value="1,240" />
          <StatCard title="Conversion Rate" value="8.4%" />
        </div>

        {/* DATA PLACEHOLDER */}
        <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Megaphone size={40} className="text-gray-300" />
          </div>
          <p className="text-lg font-medium">No campaign data found for this tenant yet.</p>
          <p className="text-sm mb-6 text-gray-400">Your specific database records will appear here.</p>
          <button className="text-[#5D00B1] font-bold hover:underline">
            + Create Your First Campaign
          </button>
        </div>
      </main>
    </div>
  );
}

/* HELPER COMPONENTS */

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-white/10 text-white shadow-inner' : 'text-indigo-200 hover:bg-white/5'
    }`}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
      <p className="text-4xl font-bold text-[#4B0082] mt-2">{value}</p>
    </div>
  );
}