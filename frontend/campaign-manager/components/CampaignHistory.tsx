"use client";
import { useState } from 'react';
import { BarChart3, Mail, MailOpen, MousePointerClick, ArrowLeft, Repeat, Clock, CheckCircle2 } from 'lucide-react';

// Mock data to simulate what your friend's RDS backend will return
const mockCampaigns = [
  { id: 1, name: "Summer Blowout 2026", segment: "Premium", status: "Sent", date: "Oct 12, 2026", sent: 1250, opens: 850, clicks: 320 },
  { id: 2, name: "Diwali Sweets Offer", segment: "Explorers", status: "Sent", date: "Oct 20, 2026", sent: 800, opens: 410, clicks: 105 },
  { id: 3, name: "Winter Jacket Pre-sale", segment: "All", status: "Draft", date: "Nov 01, 2026", sent: 0, opens: 0, clicks: 0 },
];

export default function CampaignHistory() {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  // --- ROI DETAIL VIEW ---
  if (selectedCampaign) {
    const openRate = Math.round((selectedCampaign.opens / selectedCampaign.sent) * 100) || 0;
    const clickRate = Math.round((selectedCampaign.clicks / selectedCampaign.opens) * 100) || 0;

    return (
      <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
        <button 
          onClick={() => setSelectedCampaign(null)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
        >
          <ArrowLeft size={20} /> Back to History
        </button>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">{selectedCampaign.name}</h2>
            <p className="text-gray-500 flex items-center gap-2">
              Target: <span className="font-bold text-indigo-600">{selectedCampaign.segment}</span> | 
              Sent on: {selectedCampaign.date}
            </p>
          </div>
          <button className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all">
            <Repeat size={18} /> Run Again
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Mail className="text-blue-500"/>} title="Total Sent" value={selectedCampaign.sent} sub={`${selectedCampaign.sent} delivered`} />
          <StatCard icon={<MailOpen className="text-green-500"/>} title="Open Rate" value={`${openRate}%`} sub={`${selectedCampaign.opens} unique opens`} />
          <StatCard icon={<MousePointerClick className="text-purple-500"/>} title="Click-Through" value={`${clickRate}%`} sub={`${selectedCampaign.clicks} link clicks`} />
        </div>
      </div>
    );
  }

  // --- MAIN LIST VIEW ---
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <h2 className="text-xl font-bold text-[#4B0082] flex items-center gap-2">
          <Clock size={24} /> Previous Campaigns
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-8 py-5">Campaign Name</th>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockCampaigns.map((camp) => (
              <tr key={camp.id} className="hover:bg-indigo-50/20 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-bold text-gray-800">{camp.name}</p>
                  <p className="text-xs text-gray-500">Segment: {camp.segment}</p>
                </td>
                <td className="px-8 py-5 text-sm text-gray-600">{camp.date}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex w-max items-center gap-1 ${
                    camp.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {camp.status === 'Sent' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                    {camp.status}
                  </span>
                </td>
                <td className="px-8 py-5 flex justify-end gap-3">
                  {camp.status === 'Sent' ? (
                    <button 
                      onClick={() => setSelectedCampaign(camp)}
                      className="text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 flex items-center gap-2"
                    >
                      <BarChart3 size={16} /> View ROI
                    </button>
                  ) : (
                    <button className="text-gray-600 bg-gray-100 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200">
                      Edit Draft
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Small helper component for the ROI cards
function StatCard({ icon, title, value, sub }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
      <p className="text-4xl font-black text-gray-800 mb-2">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{sub}</p>
    </div>
  );
}