import React from 'react';
import { 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, Badge } from '../components/UI';
import { formatCurrency, cn } from '../lib/utils';

const data = [
  { name: 'Jan', payments: 45000, invoices: 52000 },
  { name: 'Feb', payments: 52000, invoices: 48000 },
  { name: 'Mar', payments: 48000, invoices: 61000 },
  { name: 'Apr', payments: 61000, invoices: 55000 },
  { name: 'May', payments: 55000, invoices: 67000 },
  { name: 'Jun', payments: 67000, invoices: 72000 },
];

const pieData = [
  { name: 'Paid', value: 75, color: '#0d9488' },
  { name: 'Pending', value: 15, color: '#0891b2' },
  { name: 'Overdue', value: 10, color: '#e11d48' },
];

const branchData = [
  { name: 'Main Branch', value: 450 },
  { name: 'North Clinic', value: 320 },
  { name: 'West Dental', value: 217 },
];

export const DashboardPage: React.FC = () => {
  const kpis = [
    { label: 'Total Patients', value: '987', icon: Users, trend: '+12%', trendUp: true, color: 'text-primary', bg: 'bg-primary-container/20' },
    { label: 'Active Patients', value: '842', icon: TrendingUp, trend: '+5%', trendUp: true, color: 'text-secondary', bg: 'bg-secondary-container/20' },
    { label: 'Outstanding Balance', value: formatCurrency(124500), icon: AlertCircle, trend: '-8%', trendUp: false, color: 'text-error', bg: 'bg-error-container/20' },
    { label: 'Payments Collected', value: formatCurrency(3514535), icon: CreditCard, trend: '+18%', trendUp: true, color: 'text-primary', bg: 'bg-primary-container/20' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface-variant mb-1">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-on-surface">{kpi.value}</h3>
                <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", kpi.trendUp ? "text-primary" : "text-error")}>
                  {kpi.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {kpi.trend}
                  <span className="text-on-surface-variant/60 font-normal ml-1">vs last month</span>
                </div>
              </div>
              <div className={cn("p-3 rounded-xl", kpi.bg, kpi.color)}>
                <kpi.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-on-surface text-lg">Financial Overview</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-on-surface-variant">Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="text-on-surface-variant">Invoices</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-on-surface-variant)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-on-surface-variant)', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'var(--color-surface-container-high)', opacity: 0.4}}
                  contentStyle={{backgroundColor: 'var(--color-surface-container-highest)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: 'var(--color-on-surface)'}}
                />
                <Bar dataKey="payments" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="invoices" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-on-surface text-lg mb-8">Invoice Status</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold text-on-surface">75%</p>
              <p className="text-xs text-on-surface-variant font-medium">Collection</p>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm text-on-surface-variant">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-on-surface">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-on-surface text-lg">Recently Added Patients</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-xl transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant font-bold">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">John Doe</p>
                    <p className="text-xs text-on-surface-variant">Added 2 hours ago</p>
                  </div>
                </div>
                <Badge variant="info">New</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-on-surface text-lg mb-6">Patient Distribution by Branch</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-outline-variant)" opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--color-on-surface-variant)', fontSize: 12}} width={100} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="var(--color-secondary)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

