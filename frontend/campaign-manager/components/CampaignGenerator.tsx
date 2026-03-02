"use client";
import { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

export default function CampaignGenerator({ 
  tenantName, 
  segmentData = [] 
}: { 
  tenantName: string, 
  segmentData?: any[] 
}) {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [form, setForm] = useState({ item: '', price: '', cat: 'Fashion', disc: 15 });

  const handleGenerate = async () => {
    if (!segmentData || segmentData.length === 0) {
      alert("Please upload customer data in AI Insights first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenant_name: tenantName, 
          item: form.item,
          price: Number(form.price),
          cat: form.cat,
          disc: Number(form.disc),
          customer_data: segmentData 
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setCampaigns(data.campaigns);
      } else {
        alert("Server Error: " + data.detail);
      }
    } catch (error) {
      alert("Check if Backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Product</label>
          <input className="w-full bg-gray-50 p-3 rounded-xl outline-none border-2 border-transparent focus:border-indigo-100" 
            placeholder="Designer Bag" onChange={e => setForm({...form, item: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Price (₹)</label>
          <input className="w-full bg-gray-50 p-3 rounded-xl outline-none" 
            type="number" placeholder="5000" onChange={e => setForm({...form, price: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Category</label>
          <select className="w-full bg-gray-50 p-3 rounded-xl outline-none" onChange={e => setForm({...form, cat: e.target.value})}>
            <option>Fashion</option><option>Electronics</option><option>Home</option>
          </select>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="bg-[#4B0082] text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3b0066] disabled:bg-gray-300 transition-all">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} Generate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((camp, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border-t-4 border-indigo-500 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase text-gray-400">Target Segment</span>
                <span className="text-xs font-bold text-indigo-600">{camp.target_segment}</span>
             </div>
             <p className="font-bold text-gray-800 mb-2">{camp.subject}</p>
             <div className="text-xs text-gray-500 h-40 overflow-y-auto mb-4 bg-gray-50 p-4 rounded-xl italic leading-relaxed whitespace-pre-wrap">
                {camp.body}
             </div>
             <button className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black">
                <Send size={18} /> Send Campaign
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}