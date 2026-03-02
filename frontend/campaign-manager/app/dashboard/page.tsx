"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, Users, BarChart3, Settings, 
  LogOut, Megaphone, Upload, Loader2 
} from 'lucide-react';
import CustomerClusters from '@/components/CustomerClusters';
import CampaignGenerator from '@/components/CampaignGenerator';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantId = searchParams.get('id');

  const [currentTab, setCurrentTab] = useState('Overview');
  const [segmentData, setSegmentData] = useState<any[]>([]); // Initialized as empty array
  const [summary, setSummary] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('All');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/segment-customers', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.status === "success") {
        setSegmentData(result.data);
        setSummary(result.summary);
      }
    } catch (error) {
      alert("Backend connection failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCustomers = selectedSegment === 'All' 
    ? segmentData 
    : segmentData.filter(c => c.segment_name === selectedSegment);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#4B0082] text-white p-6 flex flex-col h-screen sticky top-0">
        <h2 className="text-2xl font-bold mb-10 text-indigo-100">Campaign Manager</h2>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setCurrentTab('Overview')} className="w-full text-left">
            <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active={currentTab === 'Overview'} />
          </button>
          <button onClick={() => setCurrentTab('AI Insights')} className="w-full text-left">
            <NavItem icon={<BarChart3 size={20}/>} label="AI Insights" active={currentTab === 'AI Insights'} />
          </button>
          <button onClick={() => setCurrentTab('Campaigns')} className="w-full text-left">
            <NavItem icon={<Users size={20}/>} label="Campaigns" active={currentTab === 'Campaigns'} />
          </button>
          <NavItem icon={<Settings size={20}/>} label="Settings" />
        </nav>
        <button onClick={() => router.push('/')} className="flex items-center gap-3 text-indigo-200 hover:text-white pt-6 border-t border-indigo-800 mt-auto mb-4">
          <LogOut size={20} /> <span className="font-semibold">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{currentTab}</h1>
            <p className="text-gray-500 text-sm italic">Tenant Context: {tenantId || 'Default'}</p>
          </div>

          {currentTab === 'AI Insights' && (
            <label className="flex items-center gap-2 bg-[#5D00B1] text-white px-5 py-2.5 rounded-xl cursor-pointer hover:bg-[#4B0082] transition-all shadow-lg">
              {isUploading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20} />}
              <span className="font-bold text-sm">Upload CSV</span>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
            </label>
          )}
        </header>

        {/* OVERVIEW TAB */}
        {currentTab === 'Overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Customers" value={segmentData.length.toString()} />
              <StatCard title="Segments" value={summary ? "4" : "0"} />
              <StatCard title="Top Group" value={summary ? "Premium" : "N/A"} />
              <StatCard title="Sync Status" value="Local" />
            </div>
            {!summary && (
              <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed flex flex-col items-center italic text-gray-400">
                <Megaphone size={48} className="mb-4 opacity-20" />
                Navigate to AI Insights to upload and analyze data.
              </div>
            )}
          </div>
        )}

        {/* AI INSIGHTS TAB */}
        {currentTab === 'AI Insights' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {segmentData.length > 0 ? (
              <>
                <CustomerClusters data={segmentData} />
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-700">Detailed Customer Breakdown</h3>
                    <select 
                      className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-200"
                      onChange={(e) => setSelectedSegment(e.target.value)}
                    >
                      <option value="All">All Segments</option>
                      <option value="Premium Customers">Premium</option>
                      <option value="Explorers">Explorers</option>
                      <option value="Occasional Buyers">Occasional</option>
                      <option value="Price-Sensitive Customers">Price Sensitive</option>
                    </select>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-400 sticky top-0">
                        <tr>
                          <th className="px-6 py-4">Customer ID</th>
                          <th className="px-6 py-4">Segment</th>
                          <th className="px-6 py-4">Total Spend</th>
                          <th className="px-6 py-4">Frequency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredCustomers.slice(0, 50).map((customer, i) => (
                          <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-600">{customer.customer_id}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                customer.segment_name === 'Premium Customers' ? 'bg-green-100 text-green-700' :
                                customer.segment_name === 'Explorers' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {customer.segment_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-700">₹{customer.monetary}</td>
                            <td className="px-6 py-4 text-gray-500">{customer.frequency} orders</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-20 text-center text-gray-400 italic">Please upload a file to begin AI analysis.</div>
            )}
          </div>
        )}

        {/* CAMPAIGNS TAB - FIXED PROP PASSING */}
        {currentTab === 'Campaigns' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CampaignGenerator 
                tenantName={tenantId || 'Your Enterprise'} 
                segmentData={segmentData} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

// ... NavItem and StatCard helper components remain the same
function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
      <div className={`flex items-center gap-4 p-3.5 rounded-xl transition-all ${
        active ? 'bg-white text-[#4B0082] shadow-lg scale-105' : 'text-indigo-200 hover:bg-white/10'
      }`}>
        {icon} <span className="font-bold text-sm">{label}</span>
      </div>
    );
  }
  
  function StatCard({ title, value }: { title: string, value: string }) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-[#4B0082]">{value}</p>
      </div>
    );
  }
