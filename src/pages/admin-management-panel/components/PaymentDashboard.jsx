import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PaymentDashboard = ({ transactions, onExportReport, onProcessRefund }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const periodOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const periodMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };

    const cutoffDate = new Date(now.getTime() - periodMs[selectedPeriod]);
    const filteredTransactions = transactions?.filter(t => new Date(t.date) >= cutoffDate);

    const totalRevenue = filteredTransactions?.filter(t => t?.status === 'completed')?.reduce((sum, t) => sum + t?.amount, 0);

    const totalTransactions = filteredTransactions?.length;
    const successfulTransactions = filteredTransactions?.filter(t => t?.status === 'completed')?.length;
    const failedTransactions = filteredTransactions?.filter(t => t?.status === 'failed')?.length;
    const pendingTransactions = filteredTransactions?.filter(t => t?.status === 'pending')?.length;
    const refundedAmount = filteredTransactions?.filter(t => t?.status === 'refunded')?.reduce((sum, t) => sum + t?.amount, 0);

    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    return {
      totalRevenue,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      refundedAmount,
      successRate,
      filteredTransactions
    };
  }, [transactions, selectedPeriod]);

  // Prepare chart data
  const dailyRevenueData = useMemo(() => {
    const days = {};
    const now = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date?.toISOString()?.split('T')?.[0];
      days[dateStr] = { date: dateStr, revenue: 0, transactions: 0 };
    }

    // Fill with actual data
    metrics?.filteredTransactions?.filter(t => t?.status === 'completed')?.forEach(transaction => {
        const dateStr = transaction?.date?.split('T')?.[0];
        if (days?.[dateStr]) {
          days[dateStr].revenue += transaction?.amount;
          days[dateStr].transactions += 1;
        }
      });

    return Object.values(days)?.map(day => ({
      ...day,
      date: new Date(day.date)?.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    }));
  }, [metrics?.filteredTransactions]);

  const statusDistributionData = [
    { name: 'Completed', value: metrics?.successfulTransactions, color: '#00FF88' },
    { name: 'Pending', value: metrics?.pendingTransactions, color: '#FFB800' },
    { name: 'Failed', value: metrics?.failedTransactions, color: '#FF4757' },
    { name: 'Refunded', value: metrics?.filteredTransactions?.filter(t => t?.status === 'refunded')?.length, color: '#A0A0AB' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-success/20 text-success border-success/30', label: 'Completed' },
      pending: { color: 'bg-warning/20 text-warning border-warning/30', label: 'Pending' },
      failed: { color: 'bg-error/20 text-error border-error/30', label: 'Failed' },
      refunded: { color: 'bg-muted/20 text-muted-foreground border-muted/30', label: 'Refunded' }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-inter font-medium border ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-xl font-orbitron font-bold text-foreground">Payment Dashboard</h3>
          <p className="text-sm font-inter text-muted-foreground mt-1">
            Track revenue, transactions, and payment analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e?.target?.value)}
            className="px-4 py-2 bg-input border border-border rounded-lg text-foreground font-inter focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {periodOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            iconName="Download"
            onClick={() => onExportReport(selectedPeriod)}
          >
            Export Report
          </Button>
        </div>
      </div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success to-success/80 flex items-center justify-center neon-glow">
              <Icon name="TrendingUp" size={24} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-inter text-muted-foreground">Success Rate</p>
              <p className="text-sm font-jetbrains text-success">{metrics?.successRate?.toFixed(1)}%</p>
            </div>
          </div>
          <h3 className="text-2xl font-orbitron font-bold text-foreground mb-1">
            ₹{metrics?.totalRevenue?.toLocaleString('en-IN')}
          </h3>
          <p className="text-sm font-inter text-muted-foreground">Total Revenue</p>
        </div>

        <div className="glass rounded-xl p-6 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center neon-glow">
              <Icon name="CreditCard" size={24} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-inter text-muted-foreground">Completed</p>
              <p className="text-sm font-jetbrains text-success">{metrics?.successfulTransactions}</p>
            </div>
          </div>
          <h3 className="text-2xl font-orbitron font-bold text-foreground mb-1">
            {metrics?.totalTransactions}
          </h3>
          <p className="text-sm font-inter text-muted-foreground">Total Transactions</p>
        </div>

        <div className="glass rounded-xl p-6 bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center neon-glow">
              <Icon name="Clock" size={24} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-inter text-muted-foreground">Failed</p>
              <p className="text-sm font-jetbrains text-error">{metrics?.failedTransactions}</p>
            </div>
          </div>
          <h3 className="text-2xl font-orbitron font-bold text-foreground mb-1">
            {metrics?.pendingTransactions}
          </h3>
          <p className="text-sm font-inter text-muted-foreground">Pending Payments</p>
        </div>

        <div className="glass rounded-xl p-6 bg-gradient-to-br from-error/20 to-error/5 border border-error/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-error to-error/80 flex items-center justify-center neon-glow">
              <Icon name="RefreshCw" size={24} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-inter text-muted-foreground">Refunds</p>
              <p className="text-sm font-jetbrains text-error">
                {metrics?.filteredTransactions?.filter(t => t?.status === 'refunded')?.length}
              </p>
            </div>
          </div>
          <h3 className="text-2xl font-orbitron font-bold text-foreground mb-1">
            ₹{metrics?.refundedAmount?.toLocaleString('en-IN')}
          </h3>
          <p className="text-sm font-inter text-muted-foreground">Refunded Amount</p>
        </div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="glass rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h4 className="font-inter font-semibold text-foreground">Daily Revenue Trend</h4>
            <p className="text-sm text-muted-foreground mt-1">Revenue and transaction count over time</p>
          </div>
          <div className="p-6">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#A0A0AB" 
                    fontSize={12}
                    fontFamily="Inter"
                  />
                  <YAxis 
                    stroke="#A0A0AB" 
                    fontSize={12}
                    fontFamily="Inter"
                    tickFormatter={(value) => `₹${value?.toLocaleString('en-IN')}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1A1A2E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `₹${value?.toLocaleString('en-IN')}` : value,
                      name === 'revenue' ? 'Revenue' : 'Transactions'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#00F5FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="glass rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h4 className="font-inter font-semibold text-foreground">Payment Status Distribution</h4>
            <p className="text-sm text-muted-foreground mt-1">Breakdown of transaction statuses</p>
          </div>
          <div className="p-6">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistributionData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1A1A2E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {statusDistributionData?.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item?.color }}
                  ></div>
                  <span className="text-sm font-inter text-foreground">{item?.name}</span>
                  <span className="text-sm font-jetbrains text-muted-foreground ml-auto">{item?.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Recent Transactions */}
      <div className="glass rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-inter font-semibold text-foreground">Recent Transactions</h4>
              <p className="text-sm text-muted-foreground mt-1">Latest payment activities</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="ExternalLink"
              onClick={() => onExportReport('transactions')}
            >
              View All
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/5 border-b border-border">
              <tr>
                <th className="p-4 text-left font-inter font-semibold text-foreground">Transaction ID</th>
                <th className="p-4 text-left font-inter font-semibold text-foreground">Team</th>
                <th className="p-4 text-left font-inter font-semibold text-foreground">Amount</th>
                <th className="p-4 text-left font-inter font-semibold text-foreground">Status</th>
                <th className="p-4 text-left font-inter font-semibold text-foreground">Date</th>
                <th className="p-4 text-left font-inter font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.filteredTransactions?.slice(0, 10)?.map((transaction) => (
                <tr key={transaction?.id} className="border-b border-border hover:bg-white/5 transition-smooth">
                  <td className="p-4">
                    <span className="font-jetbrains text-foreground text-sm">{transaction?.id}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-inter text-foreground">{transaction?.teamName}</p>
                      <p className="text-sm text-muted-foreground">{transaction?.leaderName}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-jetbrains text-foreground">₹{transaction?.amount?.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(transaction?.status)}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-inter text-foreground">
                        {new Date(transaction.date)?.toLocaleDateString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date)?.toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Eye"
                        onClick={() => setSelectedTransaction(transaction)}
                      />
                      {transaction?.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="RefreshCw"
                          onClick={() => onProcessRefund(transaction)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;