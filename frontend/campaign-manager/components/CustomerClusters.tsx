"use client";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

type ClusterDataPoint = {
  pc1: number;
  pc2: number;
  segment_name: string;
};

type CustomerClustersProps = {
  data: ClusterDataPoint[];
};

const COLORS: Record<string, string> = {
  'Premium Customers': '#10b981',      // Green
  'Price-Sensitive Customers': '#3b82f6', // Blue
  'Explorers': '#f59e0b',              // Orange
  'Occasional Buyers': '#ef4444'       // Red
};

export default function CustomerClusters({ data }: CustomerClustersProps) {
  return (
    <div className="w-full h-[500px] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Customer Segmentation Map (PCA)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="pc1" name="PC1" hide />
          <YAxis type="number" dataKey="pc2" name="PC2" hide />
          <ZAxis type="category" dataKey="segment_name" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          
          {/* We create a separate Scatter for each segment to get the legend right */}
          {Object.keys(COLORS).map((segment) => (
            <Scatter 
              key={segment}
              name={segment} 
              data={data.filter(d => d.segment_name === segment)} 
              fill={COLORS[segment]} 
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}