import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { teamService } from '../../services/teamService';
import { paymentService } from '../../services/paymentService';
import { notificationService } from '../../services/notificationService';
import Header from '../../components/ui/Header';
import TeamInfoCard from './components/TeamInfoCard';
import MemberCard from './components/MemberCard';
import PaymentHistoryCard from './components/PaymentHistoryCard';
import DocumentUpload from './components/DocumentUpload';
import RecentUpdates from './components/RecentUpdates';
import QRCodeModal from './components/QRCodeModal';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeRegistrations: 0,
    completedPayments: 0,
    unreadNotifications: 0
  });

  // Load dashboard data
  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user teams
      const { data: teamsData, error: teamsError } = await teamService?.getUserTeams(user?.id);
      if (teamsError) throw teamsError;

      setTeams(teamsData || []);
      if (teamsData?.length > 0) {
        setActiveTeam(teamsData?.[0]);
      }

      // Load payments
      const { data: paymentsData } = await paymentService?.getUserPayments(user?.id);
      setPayments(paymentsData || []);

      // Load notifications
      const { data: notificationsData } = await notificationService?.getUserNotifications(user?.id, 10);
      setNotifications(notificationsData || []);

      // Get unread notifications count
      const { count: unreadCount } = await notificationService?.getUnreadCount(user?.id);

      // Calculate stats
      setStats({
        totalTeams: teamsData?.length || 0,
        activeRegistrations: teamsData?.filter(team => 
          team?.status === 'submitted' || team?.status === 'approved'
        )?.length || 0,
        completedPayments: paymentsData?.filter(payment => 
          payment?.status === 'paid'
        )?.length || 0,
        unreadNotifications: unreadCount || 0
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamUpdate = async () => {
    // Reload teams after update
    await loadDashboardData();
  };

  const handlePaymentComplete = async () => {
    // Reload payment data after completion
    await loadDashboardData();
  };

  // Redirect if not authenticated
  if (!user) {
    navigate('/authentication-screen');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={userProfile} notifications={stats?.unreadNotifications} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
              <Icon name="Loader2" size={32} className="text-primary-foreground animate-spin" />
            </div>
            <h3 className="text-xl font-orbitron font-bold text-foreground mb-2">
              Loading Dashboard...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={userProfile} notifications={stats?.unreadNotifications} />
      
      {/* Main Content */}
      <main className="pt-16 pb-8">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-orbitron font-bold text-foreground mb-2">
              Welcome back, {userProfile?.full_name || 'Participant'}!
            </h1>
            <p className="text-muted-foreground font-inter">
              Manage your hackathon teams, track registrations, and stay updated with the latest news.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-inter">Total Teams</p>
                  <p className="text-2xl font-orbitron font-bold text-foreground">{stats?.totalTeams}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-inter">Active</p>
                  <p className="text-2xl font-orbitron font-bold text-foreground">{stats?.activeRegistrations}</p>
                </div>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-secondary" />
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-inter">Payments</p>
                  <p className="text-2xl font-orbitron font-bold text-foreground">{stats?.completedPayments}</p>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="CreditCard" size={20} className="text-accent" />
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-inter">Updates</p>
                  <p className="text-2xl font-orbitron font-bold text-foreground">{stats?.unreadNotifications}</p>
                </div>
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Bell" size={20} className="text-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* No Teams State */}
          {teams?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-orbitron font-bold text-foreground mb-2">
                No Teams Yet
              </h3>
              <p className="text-muted-foreground font-inter mb-6">
                Create your first team to start participating in hackathons
              </p>
              <Button
                onClick={() => navigate('/team-registration-form')}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Create Team
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Team Info */}
                {activeTeam && (
                  <TeamInfoCard 
                    team={activeTeam} 
                    onUpdate={handleTeamUpdate}
                    onShowQR={() => setShowQRModal(true)}
                    onEdit={() => navigate('/team-registration-form')}
                    onGenerateQR={() => setShowQRModal(true)}
                  />
                )}

                {/* Team Members */}
                {activeTeam?.team_members && (
                  <div className="glass rounded-2xl p-6 border border-border">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-orbitron font-bold text-foreground">
                        Team Members ({activeTeam?.team_members?.length}/{activeTeam?.max_members || 4})
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQRModal(true)}
                        iconName="UserPlus"
                        iconPosition="left"
                      >
                        Invite
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {activeTeam?.team_members?.map((member, index) => (
                        <MemberCard 
                          key={member?.id || index} 
                          member={member} 
                          isLeader={member?.role === 'leader'}
                          onEdit={() => {}}
                          onRemove={() => {}}
                          canRemove={false}
                          isEditing={false}
                          onSave={() => {}}
                          onCancel={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Upload */}
                {activeTeam && (
                  <DocumentUpload 
                    teamId={activeTeam?.id}
                    onUploadComplete={handleTeamUpdate}
                    documents={[]}
                    onUpload={() => {}}
                    onRemove={() => {}}
                  />
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Payment History */}
                <PaymentHistoryCard 
                  payments={payments} 
                  onPaymentComplete={handlePaymentComplete}
                />

                {/* Recent Updates */}
                <RecentUpdates 
                  updates={notifications} 
                  notificationCount={notifications?.length || 0}
                />

                {/* Quick Actions */}
                <div className="glass rounded-2xl p-6 border border-border">
                  <h3 className="text-lg font-orbitron font-bold text-foreground mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/team-registration-form')}
                      iconName="Plus"
                      iconPosition="left"
                      className="w-full justify-start"
                    >
                      Create New Team
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/event-updates-hub')}
                      iconName="Bell"
                      iconPosition="left"
                      className="w-full justify-start"
                    >
                      View All Updates
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/payment-processing-screen')}
                      iconName="CreditCard"
                      iconPosition="left"
                      className="w-full justify-start"
                    >
                      Make Payment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      {showQRModal && activeTeam && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          team={activeTeam}
        />
      )}

      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(20)]?.map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamDashboard;