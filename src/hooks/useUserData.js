import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to provide consistent user data access with proper fallbacks
 * and error handling across all components
 */
export const useUserData = () => {
  const { user, userProfile, loading, authError } = useAuth();

  // Create a normalized user object that components can safely use
  const normalizedUser = userProfile ? {
    // Primary fields from userProfile
    id: userProfile.id,
    email: userProfile.email,
    full_name: userProfile.full_name,
    name: userProfile.full_name, // Alias for backward compatibility
    role: userProfile.role,
    university: userProfile.university,
    student_id: userProfile.student_id,
    phone_number: userProfile.phone_number,
    profile_picture_url: userProfile.profile_picture_url,
    is_verified: userProfile.is_verified,
    is_active: userProfile.is_active,
    bio: userProfile.bio,
    skills: userProfile.skills || [],
    github_url: userProfile.github_url,
    linkedin_url: userProfile.linkedin_url,
    website_url: userProfile.website_url,
    created_at: userProfile.created_at,
    updated_at: userProfile.updated_at
  } : null;

  // Provide safe display values with fallbacks
  const displayName = normalizedUser?.full_name || 
                     normalizedUser?.name || 
                     user?.email?.split('@')[0] || 
                     'User';

  const displayEmail = normalizedUser?.email || user?.email || '';

  const displayRole = normalizedUser?.role || 'participant';

  const displayInitials = displayName?.charAt(0)?.toUpperCase() || 'U';

  const profilePicture = normalizedUser?.profile_picture_url || null;

  // Check if user data is complete
  const isProfileComplete = !!(
    normalizedUser?.full_name &&
    normalizedUser?.email
  );

  // Check if user is authenticated
  const isAuthenticated = !!(user && normalizedUser);

  // Check if we're still loading user data
  const isLoading = loading || (user && !userProfile);

  // Check for authentication errors
  const hasAuthError = !!authError;

  return {
    // Raw data
    user,
    userProfile,
    normalizedUser,
    
    // Display values
    displayName,
    displayEmail,
    displayRole,
    displayInitials,
    profilePicture,
    
    // Status flags
    isAuthenticated,
    isProfileComplete,
    isLoading,
    hasAuthError,
    authError,
    
    // Utility functions
    getDisplayName: () => displayName,
    getDisplayEmail: () => displayEmail,
    getDisplayRole: () => displayRole,
    getDisplayInitials: () => displayInitials,
    getProfilePicture: () => profilePicture,
    
    // Check functions
    hasRole: (role) => displayRole === role,
    isAdmin: () => displayRole === 'admin',
    isParticipant: () => displayRole === 'participant',
    isMentor: () => displayRole === 'mentor',
    
    // Profile completeness checks
    hasBasicInfo: () => !!(normalizedUser?.full_name && normalizedUser?.email),
    hasContactInfo: () => !!(normalizedUser?.phone_number),
    hasUniversityInfo: () => !!(normalizedUser?.university),
    hasSocialLinks: () => !!(normalizedUser?.github_url || normalizedUser?.linkedin_url || normalizedUser?.website_url),
    hasSkills: () => !!(normalizedUser?.skills?.length > 0),
    hasBio: () => !!(normalizedUser?.bio),
    
    // Profile completion percentage
    getProfileCompletionPercentage: () => {
      if (!normalizedUser) return 0;
      
      const checks = [
        !!normalizedUser.full_name,
        !!normalizedUser.email,
        !!normalizedUser.phone_number,
        !!normalizedUser.university,
        !!normalizedUser.bio,
        !!(normalizedUser.skills?.length > 0),
        !!(normalizedUser.github_url || normalizedUser.linkedin_url || normalizedUser.website_url)
      ];
      
      const completedChecks = checks.filter(Boolean).length;
      return Math.round((completedChecks / checks.length) * 100);
    }
  };
};

export default useUserData;
