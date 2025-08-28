import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { teamService } from '../../services/teamService';
import { paymentService } from '../../services/paymentService';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetricsCard from './components/MetricsCard';
import TeamDataTable from './components/TeamDataTable';
import UpdatePublisher from './components/UpdatePublisher';
import PaymentDashboard from './components/PaymentDashboard';
import EmailTemplateEditor from './components/EmailTemplateEditor';

const AdminManagementPanel = () => {
  const navigate = useNavigate();
  const { user: authUser, userProfile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Real admin data will be loaded from auth context
  const [adminUser, setAdminUser] = useState(null);
  const [metrics, setMetrics] = useState({
    totalRegistrations: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    averageTeamSize: 0,
    femaleParticipation: 0
  });

  // Real teams data will be loaded from database
  const [teams, setTeams] = useState([]);

  // Real transactions data will be loaded from database
  const [transactions, setTransactions] = useState([]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'teams', label: 'Team Management', icon: 'Users' },
    { id: 'updates', label: 'Updates', icon: 'Megaphone' },
    { id: 'payments', label: 'Payments', icon: 'CreditCard' },
    { id: 'templates', label: 'Email Templates', icon: 'Mail' }
  ];

  useEffect(() => {
    if (!authLoading) {
      loadAdminData();
    }
  }, [authLoading, authUser]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      // Check if user is admin
      if (!authUser || userProfile?.role !== 'admin') {
        navigate('/authentication-screen');
        return;
      }

      // Load all teams for admin view
      const { data: teamsData, error: teamsError } = await teamService.getAllTeams();
      if (!teamsError && teamsData) {
        setTeams(teamsData);
      }

      // Load all transactions for admin view
      const { data: transactionsData, error: transactionsError } = await paymentService.getAllPayments();
      if (!transactionsError && transactionsData) {
        setTransactions(transactionsData);
      }

      // Calculate metrics from real data
      const totalRegistrations = teamsData?.length || 0;
      const completedPayments = transactionsData?.filter(t => t.status === 'paid')?.length || 0;
      const pendingPayments = transactionsData?.filter(t => t.status === 'pending')?.length || 0;
      const totalRevenue = transactionsData?.filter(t => t.status === 'paid')?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setMetrics({
        totalRegistrations,
        totalRevenue,
        pendingPayments,
        completedPayments,
        averageTeamSize: totalRegistrations > 0 ? (teamsData?.reduce((sum, t) => sum + (t.member_count || 0), 0) / totalRegistrations).toFixed(1) : 0,
        femaleParticipation: 0 // This would need additional calculation based on member data
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleViewTeam = (team) => {
    console.log('Viewing team:', team);
    // In a real app, this would open a detailed team view modal
  };

  const handleEditTeam = (team) => {
    console.log('Editing team:', team);
    // In a real app, this would open an edit form modal
  };

  const handleProcessRefund = (team) => {
    console.log('Processing refund for team:', team);
    // In a real app, this would initiate refund process
  };

  const handleBulkAction = (action, selectedTeams) => {
    console.log('Bulk action:', action, 'for teams:', selectedTeams);
    // In a real app, this would handle bulk operations
  };

  const handlePublishUpdate = async (updateData) => {
    console.log('Publishing update:', updateData);
    // In a real app, this would publish the update
    return new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleScheduleUpdate = async (updateData) => {
    console.log('Scheduling update:', updateData);
    // In a real app, this would schedule the update
    return new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleExportReport = (period) => {
    console.log('Exporting report for period:', period);
    // In a real app, this would generate and download report
  };

  const handleSaveTemplate = async (templateId, templateData) => {
    console.log('Saving template:', templateId, templateData);
    // In a real app, this would save the template
    return new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleSendTestEmail = async (templateId, templateData, email) => {
    console.log('Sending test email:', templateId, 'to:', email);
    // In a real app, this would send test email
    return new Promise(resolve => setTimeout(resolve, 2000));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-inter">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Icon name="ShieldX" size={64} className="text-error mx-auto mb-4" />
          <h2 className="text-2xl font-orbitron font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground font-inter mb-6">
            You don't have permission to access the admin panel.
          </p>
          <Button
            variant="outline"
            iconName="ArrowLeft"
            onClick={() => navigate('/team-dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricsCard
                title="Total Registrations"
                value={metrics?.totalRegistrations}
                change="+12%"
                icon="Users"
                color="primary"
                trend="up"
              />
              <MetricsCard
                title="Total Revenue"
                value={`₹${metrics?.totalRevenue?.toLocaleString('en-IN')}`}
                change="+8%"
                icon="TrendingUp"
                color="success"
                trend="up"
              />
              <MetricsCard
                title="Pending Payments"
                value={metrics?.pendingPayments}
                change="-5%"
                icon="Clock"
                color="warning"
                trend="down"
              />
              <MetricsCard
                title="Completed Payments"
                value={metrics?.completedPayments}
                change="+15%"
                icon="CheckCircle"
                color="success"
                trend="up"
              />
              <MetricsCard
                title="Average Team Size"
                value={metrics?.averageTeamSize}
                change="+2%"
                icon="UserCheck"
                color="secondary"
                trend="up"
              />
              <MetricsCard
                title="Female Participation"
                value={`${metrics?.femaleParticipation}%`}
                change="+3%"
                icon="Users"
                color="secondary"
                trend="up"
              />
            </div>
            {/* Quick Actions */}
            <div className="glass rounded-xl border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-orbitron font-bold text-foreground">Quick Actions</h3>
                <p className="text-sm font-inter text-muted-foreground mt-1">
                  Frequently used administrative functions
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    iconName="Megaphone"
                    onClick={() => setActiveTab('updates')}
                    className="h-20 flex-col space-y-2"
                  >
                    <span>Publish Update</span>
                  </Button>
                  <Button
                    variant="outline"
                    iconName="Download"
                    onClick={() => handleExportReport('all')}
                    className="h-20 flex-col space-y-2"
                  >
                    <span>Export Data</span>
                  </Button>
                  <Button
                    variant="outline"
                    iconName="Mail"
                    onClick={() => setActiveTab('templates')}
                    className="h-20 flex-col space-y-2"
                  >
                    <span>Email Templates</span>
                  </Button>
                  <Button
                    variant="outline"
                    iconName="BarChart"
                    onClick={() => setActiveTab('payments')}
                    className="h-20 flex-col space-y-2"
                  >
                    <span>View Reports</span>
                  </Button>
                </div>
              </div>
            </div>
            {/* Recent Activity */}
            <div className="glass rounded-xl border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-orbitron font-bold text-foreground">Recent Activity</h3>
                <p className="text-sm font-inter text-muted-foreground mt-1">
                  Latest registrations and payments
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {teams?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground font-inter">No teams registered yet</p>
                    </div>
                  ) : (
                    teams?.slice(0, 5)?.map((team) => (
                      <div key={team?.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <span className="text-sm font-orbitron font-bold text-white">
                              {team?.name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-inter font-medium text-foreground">{team?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {team?.user_profiles?.full_name} • {team?.team_members?.length || 0} members
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-jetbrains text-foreground">
                            {team?.status === 'submitted' ? 'Submitted' : team?.status}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(team?.created_at)?.toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'teams':
        return (
          <TeamDataTable
            teams={teams}
            onViewTeam={handleViewTeam}
            onEditTeam={handleEditTeam}
            onProcessRefund={handleProcessRefund}
            onBulkAction={handleBulkAction}
          />
        );

      case 'updates':
        return (
          <UpdatePublisher
            onPublishUpdate={handlePublishUpdate}
            onScheduleUpdate={handleScheduleUpdate}
          />
        );

      case 'payments':
        return (
          <PaymentDashboard
            transactions={transactions}
            onExportReport={handleExportReport}
            onProcessRefund={handleProcessRefund}
          />
        );

      case 'templates':
        return (
          <EmailTemplateEditor
            onSaveTemplate={handleSaveTemplate}
            onSendTestEmail={handleSendTestEmail}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        notifications={3}
        onNavigate={handleNavigation}
      />
      <div className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center neon-glow">
                <Icon name="Settings" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-orbitron font-bold text-foreground">
                  Admin Management Panel
                </h1>
                <p className="text-muted-foreground font-inter">
                  Manage hackathon operations, teams, and communications
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="glass rounded-xl border border-border p-2">
              <nav className="flex space-x-1 overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-inter font-medium transition-smooth whitespace-nowrap hover:scale-105 ${
                      activeTab === tab?.id
                        ? 'bg-primary/10 text-primary neon-border' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagementPanel;