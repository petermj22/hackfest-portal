import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import UpdateCard from './components/UpdateCard';
import EventTimeline from './components/EventTimeline';
import SearchAndFilter from './components/SearchAndFilter';
import BookmarkedUpdates from './components/BookmarkedUpdates';
import QuickStats from './components/QuickStats';
import NotificationSettings from './components/NotificationSettings';

const EventUpdatesHub = () => {
  const { user, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [bookmarkedUpdates, setBookmarkedUpdates] = useState(['1', '3', '5']);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    highPriority: true,
    schedule: true,
    technical: false,
    logistics: true,
    general: false,
    delivery_push: true,
    delivery_email: true,
    delivery_sms: false,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  // Mock updates data
  const allUpdates = [
    {
      id: '1',
      title: 'Registration Deadline Extended',
      content: `Great news! Due to overwhelming response, we're extending the registration deadline by 48 hours.\n\nNew deadline: 30th August 2025, 11:59 PM IST\n\nThis gives more teams the opportunity to join HackFest 2025. Don't miss out on this amazing opportunity to showcase your skills and compete for prizes worth ₹5,00,000!`,
      category: 'schedule',
      priority: 'high',
      timestamp: new Date('2025-08-27T10:30:00'),
      author: 'Event Organizers',
      isNew: true,
      attachments: [
        { name: 'Updated_Timeline.pdf', size: '245 KB', url: '#' }
      ]
    },
    {
      id: '2',
      title: 'Technical Workshop Schedule Released',
      content: `We're excited to announce the technical workshop schedule for HackFest 2025!\n\nWorkshops include:\n• AI/ML with TensorFlow - 2nd Sept, 2:00 PM\n• Blockchain Development - 3rd Sept, 10:00 AM\n• Cloud Computing with AWS - 3rd Sept, 3:00 PM\n• Mobile App Development - 4th Sept, 11:00 AM\n\nAll workshops are free for registered participants. Limited seats available - first come, first served!`,
      category: 'technical',priority: 'medium',timestamp: new Date('2025-08-26T14:15:00'),author: 'Technical Team',
      isNew: false,
      attachments: []
    },
    {
      id: '3',title: 'Venue and Accommodation Details',
      content: `Important information about the hackathon venue and accommodation options.\n\nVenue: University Tech Park, Building A\nAddress: Sector 15, Gurgaon, Haryana 122001\n\nAccommodation:\n• On-campus hostel rooms available at ₹500/night\n• Partner hotels offering 20% discount\n• Shuttle service from railway station\n\nFood arrangements include breakfast, lunch, dinner, and 24/7 snacks during the hackathon.`,
      category: 'logistics',priority: 'medium',timestamp: new Date('2025-08-25T16:45:00'),author: 'Logistics Team',
      isNew: false,
      attachments: [
        { name: 'Venue_Map.pdf', size: '1.2 MB', url: '#' },
        { name: 'Hotel_Partners.pdf', size: '890 KB', url: '#' }
      ]
    },
    {
      id: '4',title: 'Judging Criteria and Prize Distribution',
      content: `Learn about how your projects will be evaluated and the amazing prizes waiting for winners!\n\nJudging Criteria (100 points total):\n• Innovation & Creativity (25 points)\n• Technical Implementation (25 points)\n• Business Viability (20 points)\n• Presentation & Demo (20 points)\n• Social Impact (10 points)\n\nPrizes:\n🥇 1st Place: ₹2,00,000 + Internship opportunities\n🥈 2nd Place: ₹1,00,000 + Mentorship program\n🥉 3rd Place: ₹50,000 + Tech gadgets\n\nSpecial categories include Best AI Solution, Most Innovative UI/UX, and Social Impact Award.`,
      category: 'general',priority: 'low',timestamp: new Date('2025-08-24T11:20:00'),author: 'Judging Panel',
      isNew: false,
      attachments: [
        { name: 'Judging_Rubric.pdf', size: '567 KB', url: '#' }
      ]
    },
    {
      id: '5',title: 'Team Formation Guidelines Updated',
      content: `Important updates to team formation rules and guidelines.\n\nKey Changes:\n• Minimum team size: 4 members (previously 3)\n• Maximum team size: 6 members (unchanged)\n• At least one female member required per team\n• Cross-college teams are encouraged\n• Team leader must be from the host university\n\nTeam registration closes on 29th August 2025. Make sure all team members have individual registrations completed before forming teams.`,
      category: 'schedule',priority: 'high',timestamp: new Date('2025-08-23T09:10:00'),author: 'Registration Team',
      isNew: false,
      attachments: []
    },
    {
      id: '6',title: 'Sponsor Showcase and Networking Session',
      content: `Meet our amazing sponsors and explore career opportunities!\n\nSponsors participating:\n• TechCorp India - Software Development roles\n• InnovateLabs - AI/ML positions\n• StartupHub - Internship programs\n• CloudTech Solutions - Cloud engineering roles\n\nNetworking session scheduled for 5th September, 6:00 PM - 8:00 PM\nBring your resumes and be ready to impress!`,
      category: 'general',priority: 'low',timestamp: new Date('2025-08-22T13:30:00'),author: 'Sponsorship Team',
      isNew: false,
      attachments: [
        { name: 'Sponsor_Profiles.pdf', size: '2.1 MB', url: '#' }
      ]
    }
  ];

  // Mock timeline events
  const timelineEvents = [
    {
      id: 'registration',
      title: 'Registration Phase',
      description: 'Team registration and member addition period',
      phase: 'registration',
      date: '2025-08-30',
      startTime: '00:00',
      endTime: '23:59',
      location: 'Online',
      progress: 85
    },
    {
      id: 'team-formation',
      title: 'Team Formation',
      description: 'Finalize teams and submit project proposals',
      phase: 'team-formation',
      date: '2025-09-01',
      startTime: '09:00',
      endTime: '18:00',
      location: 'University Campus'
    },
    {
      id: 'hackathon',
      title: 'Hackathon Event',
      description: '48-hour coding marathon begins',
      phase: 'hackathon',
      date: '2025-09-05',
      startTime: '18:00',
      endTime: '18:00',
      location: 'Tech Park Building A'
    },
    {
      id: 'judging',
      title: 'Project Judging',
      description: 'Present your solutions to expert judges',
      phase: 'judging',
      date: '2025-09-07',
      startTime: '10:00',
      endTime: '16:00',
      location: 'Main Auditorium'
    },
    {
      id: 'results',
      title: 'Results & Awards',
      description: 'Winner announcement and prize distribution',
      phase: 'results',
      date: '2025-09-07',
      startTime: '18:00',
      endTime: '20:00',
      location: 'Main Auditorium'
    }
  ];

  // Filter updates based on search and filters
  const filteredUpdates = useMemo(() => {
    let filtered = allUpdates;

    // Search filter
    if (searchQuery?.trim()) {
      const query = searchQuery?.toLowerCase();
      filtered = filtered?.filter(update =>
        update?.title?.toLowerCase()?.includes(query) ||
        update?.content?.toLowerCase()?.includes(query) ||
        update?.author?.toLowerCase()?.includes(query)
      );
    }

    // Category filter
    if (selectedCategories?.length > 0 && !selectedCategories?.includes('all')) {
      filtered = filtered?.filter(update =>
        selectedCategories?.includes(update?.category)
      );
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered?.filter(update => update?.priority === selectedPriority);
    }

    // Sort by timestamp (newest first)
    return filtered?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [searchQuery, selectedCategories, selectedPriority]);

  // Calculate stats
  const stats = useMemo(() => ({
    totalUpdates: allUpdates?.length,
    highPriority: allUpdates?.filter(u => u?.priority === 'high')?.length,
    bookmarked: bookmarkedUpdates?.length,
    unread: allUpdates?.filter(u => u?.isNew)?.length
  }), [bookmarkedUpdates]);

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    if (categoryId === 'all') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev =>
        prev?.includes(categoryId)
          ? prev?.filter(id => id !== categoryId)
          : [...prev, categoryId]
      );
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = (updateId) => {
    setBookmarkedUpdates(prev =>
      prev?.includes(updateId)
        ? prev?.filter(id => id !== updateId)
        : [...prev, updateId]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedPriority('all');
  };

  // Handle notification settings save
  const handleNotificationSettingsSave = (settings) => {
    setNotificationSettings(settings);
    // In real app, this would sync with backend
    console.log('Notification settings saved:', settings);
  };

  return (
    <>
      <Helmet>
        <title>Event Updates Hub - HackFest Portal</title>
        <meta name="description" content="Stay updated with real-time hackathon announcements, schedule changes, and important information for HackFest 2025." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header user={userProfile} notifications={stats?.unread} />
        
        {/* Main Content */}
        <main className="pt-16 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 rounded-xl bg-primary/20 border border-primary neon-glow">
                    <Icon name="Bell" size={28} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-orbitron font-bold text-foreground">
                      Event Updates Hub
                    </h1>
                    <p className="font-inter text-muted-foreground">
                      Stay informed with real-time hackathon announcements
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant={showBookmarks ? "default" : "outline"}
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  iconName="Bookmark"
                  iconPosition="left"
                >
                  {showBookmarks ? 'All Updates' : 'Bookmarks'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsNotificationSettingsOpen(true)}
                  iconName="Settings"
                  iconPosition="left"
                >
                  Settings
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <QuickStats stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="xl:col-span-2 space-y-6">
                {!showBookmarks && (
                  <>
                    {/* Search and Filters */}
                    <SearchAndFilter
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedCategories={selectedCategories}
                      onCategoryChange={handleCategoryChange}
                      selectedPriority={selectedPriority}
                      onPriorityChange={setSelectedPriority}
                      onClearFilters={handleClearFilters}
                    />

                    {/* Updates Feed */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-orbitron font-bold text-xl text-foreground">
                          Latest Updates
                        </h2>
                        <span className="font-inter text-sm text-muted-foreground">
                          {filteredUpdates?.length} update{filteredUpdates?.length !== 1 ? 's' : ''} found
                        </span>
                      </div>

                      {filteredUpdates?.length > 0 ? (
                        <div className="space-y-6">
                          {filteredUpdates?.map((update) => (
                            <UpdateCard
                              key={update?.id}
                              update={update}
                              onBookmark={handleBookmarkToggle}
                              isBookmarked={bookmarkedUpdates?.includes(update?.id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="glass rounded-xl border border-border p-12 text-center">
                          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="Search" size={32} className="text-muted-foreground" />
                          </div>
                          <h3 className="font-orbitron font-bold text-foreground mb-2">
                            No Updates Found
                          </h3>
                          <p className="font-inter text-muted-foreground text-sm max-w-md mx-auto mb-4">
                            No updates match your current search and filter criteria. Try adjusting your filters or search terms.
                          </p>
                          <Button variant="outline" onClick={handleClearFilters}>
                            Clear All Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {showBookmarks && (
                  <BookmarkedUpdates
                    bookmarkedUpdates={bookmarkedUpdates}
                    onRemoveBookmark={handleBookmarkToggle}
                    allUpdates={allUpdates}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <EventTimeline 
                  events={timelineEvents} 
                  currentPhase="registration" 
                />

                {/* Quick Actions */}
                <div className="glass rounded-xl border border-border p-6">
                  <h3 className="font-orbitron font-bold text-foreground mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      fullWidth
                      iconName="Users"
                      iconPosition="left"
                    >
                      View Team Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      iconName="CreditCard"
                      iconPosition="left"
                    >
                      Payment Status
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      iconName="Download"
                      iconPosition="left"
                    >
                      Download Schedule
                    </Button>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="glass rounded-xl border border-border p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-lg bg-success/20 border border-success">
                      <Icon name="HelpCircle" size={20} className="text-success" />
                    </div>
                    <h3 className="font-orbitron font-bold text-foreground">
                      Need Help?
                    </h3>
                  </div>
                  <p className="font-inter text-sm text-muted-foreground mb-4">
                    Have questions about the event or need technical support?
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-inter">
                      <Icon name="Mail" size={14} className="text-muted-foreground" />
                      <span className="text-foreground">support@hackfest.edu</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-inter">
                      <Icon name="Phone" size={14} className="text-muted-foreground" />
                      <span className="text-foreground">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-inter">
                      <Icon name="Clock" size={14} className="text-muted-foreground" />
                      <span className="text-foreground">24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Notification Settings Modal */}
        <NotificationSettings
          isOpen={isNotificationSettingsOpen}
          onClose={() => setIsNotificationSettingsOpen(false)}
          settings={notificationSettings}
          onSave={handleNotificationSettingsSave}
        />
      </div>
    </>
  );
};

export default EventUpdatesHub;