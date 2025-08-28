import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import ProfileModal from './ProfileModal';
import ProfileLoadingState from './ProfileLoadingState';
import useUserData from '../../hooks/useUserData';

const Header = ({ user = null, notifications = 0, onNavigate = () => {} }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Use the normalized user data hook for consistency
  const {
    displayName,
    displayRole,
    displayInitials,
    profilePicture,
    isAuthenticated,
    isLoading
  } = useUserData();

  // Use the passed user prop if available, otherwise use normalized data
  const currentUser = user || (isAuthenticated ? {
    full_name: displayName,
    name: displayName,
    role: displayRole,
    profile_picture_url: profilePicture
  } : null);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/team-dashboard',
      icon: 'LayoutDashboard',
      role: 'participant'
    },
    {
      label: 'Registration',
      path: '/team-registration-form',
      icon: 'UserPlus',
      role: 'participant'
    },
    {
      label: 'Payment',
      path: '/payment-processing-screen',
      icon: 'CreditCard',
      role: 'participant'
    },
    {
      label: 'Updates',
      path: '/event-updates-hub',
      icon: 'Bell',
      role: 'participant',
      badge: notifications
    }
  ];

  const moreMenuItems = [
    {
      label: 'Admin Panel',
      path: '/admin-management-panel',
      icon: 'Settings',
      role: 'admin'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onNavigate(path);
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
  };

  const isActive = (path) => location?.pathname === path;

  const canAccess = (role) => {
    if (role === 'admin') return currentUser?.role === 'admin';
    return true;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event?.target?.closest('.more-menu-container')) {
        setIsMoreMenuOpen(false);
      }
      if (!event?.target?.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const Logo = () => (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center neon-glow">
          <Icon name="Zap" size={24} className="text-primary-foreground" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></div>
      </div>
      <div className="hidden sm:block">
        <h1 className="text-xl font-orbitron font-bold text-foreground">
          HackFest
        </h1>
        <p className="text-xs font-inter text-muted-foreground -mt-1">
          Portal
        </p>
      </div>
    </div>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-1000 glass border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems?.filter(item => canAccess(item?.role))?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-inter font-medium transition-smooth hover:scale-105 ${
                  isActive(item?.path)
                    ? 'bg-primary/10 text-primary neon-border' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.label}</span>
                {item?.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-jetbrains">
                    {item?.badge > 99 ? '99+' : item?.badge}
                  </span>
                )}
              </button>
            ))}

            {/* More Menu */}
            {moreMenuItems?.some(item => canAccess(item?.role)) && (
              <div className="relative more-menu-container">
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-inter font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-smooth hover:scale-105"
                >
                  <Icon name="MoreHorizontal" size={18} />
                  <span>More</span>
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 glass rounded-lg border border-border shadow-cyber-lg">
                    {moreMenuItems?.filter(item => canAccess(item?.role))?.map((item) => (
                      <button
                        key={item?.path}
                        onClick={() => handleNavigation(item?.path)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left font-inter transition-smooth hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg ${
                          isActive(item?.path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon name={item?.icon} size={18} />
                        <span>{item?.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* User Profile & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="hidden sm:flex items-center space-x-3 p-2">
                <div className="text-right">
                  <div className="w-16 h-4 bg-white/10 rounded animate-pulse mb-1"></div>
                  <div className="w-12 h-3 bg-white/5 rounded animate-pulse"></div>
                </div>
                <ProfileLoadingState size="default" />
              </div>
            ) : currentUser && (
              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="hidden sm:flex items-center space-x-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-smooth"
              >
                <div className="text-right">
                  <p className="text-sm font-inter font-medium text-foreground">
                    {currentUser?.full_name || currentUser?.name || 'User'}
                  </p>
                  <p className="text-xs font-inter text-muted-foreground">
                    {currentUser?.role === 'admin' ? 'Administrator' : 'Participant'}
                  </p>
                </div>
                {currentUser?.profile_picture_url ? (
                  <img
                    src={currentUser.profile_picture_url}
                    alt={currentUser?.full_name || currentUser?.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                    <span className="text-sm font-orbitron font-bold text-white">
                      {(currentUser?.full_name || currentUser?.name || 'U')?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-smooth"
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass border-t border-border mobile-menu-container">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems?.filter(item => canAccess(item?.role))?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`relative w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-inter font-medium transition-smooth ${
                    isActive(item?.path)
                      ? 'bg-primary/10 text-primary neon-border' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon name={item?.icon} size={20} />
                  <span>{item?.label}</span>
                  {item?.badge > 0 && (
                    <span className="ml-auto bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-jetbrains">
                      {item?.badge > 99 ? '99+' : item?.badge}
                    </span>
                  )}
                </button>
              ))}

              {moreMenuItems?.filter(item => canAccess(item?.role))?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-inter font-medium transition-smooth ${
                    isActive(item?.path)
                      ? 'bg-primary/10 text-primary neon-border' :'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon name={item?.icon} size={20} />
                  <span>{item?.label}</span>
                </button>
              ))}

              {currentUser && (
                <div className="pt-4 mt-4 border-t border-border">
                  <div
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center space-x-3 px-4 py-2 cursor-pointer hover:bg-white/5 rounded-lg transition-smooth"
                  >
                    {currentUser?.profile_picture_url ? (
                      <img
                        src={currentUser.profile_picture_url}
                        alt={currentUser?.full_name || currentUser?.name || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                        <span className="text-sm font-orbitron font-bold text-white">
                          {(currentUser?.full_name || currentUser?.name || 'U')?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-inter font-medium text-foreground">
                        {currentUser?.full_name || currentUser?.name || 'User'}
                      </p>
                      <p className="text-xs font-inter text-muted-foreground">
                        {currentUser?.role === 'admin' ? 'Administrator' : 'Participant'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-1000 md:hidden glass border-t border-border">
        <nav className="flex items-center justify-around py-2">
          {navigationItems?.slice(0, 2)?.filter(item => canAccess(item?.role))?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`relative flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-smooth ${
                isActive(item?.path)
                  ? 'text-primary' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={item?.icon} size={20} />
              <span className="text-xs font-inter font-medium">{item?.label}</span>
              {item?.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-jetbrains">
                  {item?.badge > 9 ? '9+' : item?.badge}
                </span>
              )}
            </button>
          ))}
          
          <button
            onClick={() => handleNavigation('/event-updates-hub')}
            className={`relative flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-smooth ${
              isActive('/event-updates-hub')
                ? 'text-primary' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Bell" size={20} />
            <span className="text-xs font-inter font-medium">Updates</span>
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-jetbrains">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Header;