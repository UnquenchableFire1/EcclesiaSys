import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AnalyticsDashboard({ members, branches }) {
    
    // Process Data for Branch Chart
    const branchData = useMemo(() => {
        const counts = {};
        members.forEach(m => {
            const bName = branches.find(b => b.id === m.branchId)?.name || 'Central';
            counts[bName] = (counts[bName] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({
            name: key,
            count: counts[key]
        })).sort((a, b) => b.count - a.count);
    }, [members, branches]);

    // Process Data for Gender Pie Chart
    const genderData = useMemo(() => {
        let male = 0;
        let female = 0;
        let unassigned = 0;
        
        members.forEach(m => {
            if (m.gender === 'Male') male++;
            else if (m.gender === 'Female') female++;
            else unassigned++;
        });
        
        const data = [];
        if (male > 0) data.push({ name: 'Male', value: male, color: '#3b82f6' }); // blue
        if (female > 0) data.push({ name: 'Female', value: female, color: '#ec4899' }); // pink
        if (unassigned > 0) data.push({ name: 'Unassigned', value: unassigned, color: '#94a3b8' }); // gray
        
        return data;
    }, [members]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-mdOnSurface tracking-tighter">Analytics & Demographics</h1>
                <p className="text-mdPrimary font-black text-xs uppercase tracking-widest mt-1">Universal Registry Insights</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Branch Distribution Chart */}
                <div className="glass-card p-8 rounded-[2.5rem] border-none shadow-premium bg-white">
                    <h3 className="text-xl font-black text-mdOnSurface mb-6 uppercase tracking-tight">Branch Distribution</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={branchData}>
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold'}}
                                />
                                <Bar dataKey="count" fill="#1A2F5F" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gender Demographics Chart */}
                <div className="glass-card p-8 rounded-[2.5rem] border-none shadow-premium bg-white">
                    <h3 className="text-xl font-black text-mdOnSurface mb-6 uppercase tracking-tight">Gender Demographics</h3>
                    <div className="h-[300px] w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold'}}
                                />
                                <Legend wrapperStyle={{fontWeight: 'bold', fontSize: '12px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
