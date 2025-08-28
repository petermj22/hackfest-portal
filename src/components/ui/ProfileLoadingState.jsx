import React from 'react';
import Icon from '../AppIcon';

const ProfileLoadingState = ({ size = 'default' }) => {
  const sizeClasses = {
    small: {
      container: 'w-6 h-6',
      icon: 16
    },
    default: {
      container: 'w-8 h-8',
      icon: 20
    },
    large: {
      container: 'w-10 h-10',
      icon: 24
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  return (
    <div className={`${currentSize.container} bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center animate-pulse`}>
      <Icon name="User" size={currentSize.icon} className="text-white opacity-50" />
    </div>
  );
};

export default ProfileLoadingState;
