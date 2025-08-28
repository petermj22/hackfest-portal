import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import UpdateCard from './UpdateCard';

const BookmarkedUpdates = ({ bookmarkedUpdates, onRemoveBookmark, allUpdates }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (bookmarkedUpdates?.length === 0) {
    return (
      <div className="glass rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-warning/20 border border-warning">
            <Icon name="Bookmark" size={20} className="text-warning" />
          </div>
          <h2 className="font-orbitron font-bold text-xl text-foreground">
            Bookmarked Updates
          </h2>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="BookmarkPlus" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="font-orbitron font-bold text-foreground mb-2">
            No Bookmarks Yet
          </h3>
          <p className="font-inter text-muted-foreground text-sm max-w-md mx-auto">
            Bookmark important updates to access them quickly. Click the bookmark icon on any update to save it here.
          </p>
        </div>
      </div>
    );
  }

  const displayedUpdates = isExpanded ? bookmarkedUpdates : bookmarkedUpdates?.slice(0, 3);
  const hasMore = bookmarkedUpdates?.length > 3;

  return (
    <div className="glass rounded-xl border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-warning/20 border border-warning">
            <Icon name="Bookmark" size={20} className="text-warning" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-xl text-foreground">
              Bookmarked Updates
            </h2>
            <p className="font-inter text-sm text-muted-foreground">
              {bookmarkedUpdates?.length} saved update{bookmarkedUpdates?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-smooth"
          >
            <span className="font-inter font-medium">
              {isExpanded ? 'Show Less' : `Show All (${bookmarkedUpdates?.length})`}
            </span>
            <Icon 
              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
              size={16} 
            />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {displayedUpdates?.map((updateId) => {
          const update = allUpdates?.find(u => u?.id === updateId);
          if (!update) return null;

          return (
            <UpdateCard
              key={update?.id}
              update={update}
              onBookmark={onRemoveBookmark}
              isBookmarked={true}
            />
          );
        })}
      </div>
      {hasMore && !isExpanded && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-primary hover:text-primary/80 font-inter font-medium text-sm transition-smooth"
          >
            View {bookmarkedUpdates?.length - 3} more bookmarked updates
          </button>
        </div>
      )}
    </div>
  );
};

export default BookmarkedUpdates;