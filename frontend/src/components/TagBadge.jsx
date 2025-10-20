import React from 'react';
import './TagBadge.css';

/**
 * TagBadge - A reusable tag badge component
 * 
 * @param {Object} tag - Tag object with id, name, and color properties
 * @param {function} onClick - Click handler (optional)
 * @param {boolean} selected - Whether the tag is selected
 * @param {boolean} removable - Whether the tag can be removed
 * @param {function} onRemove - Remove handler (required if removable is true)
 * @param {string} size - Size of the tag badge: 'sm', 'md', or 'lg' (optional)
 * @returns {React.ReactElement}
 */
const TagBadge = ({ 
  tag, 
  onClick = null, 
  selected = false, 
  removable = false, 
  onRemove = null,
  size = 'md'
}) => {
  // Handle removal of the tag (if removable)
  const handleRemove = (e) => {
    if (removable && onRemove) {
      e.stopPropagation(); // Prevent triggering the parent click
      onRemove(tag);
    }
  };

  return (
    <div 
      className={`tag-badge ${selected ? 'selected' : ''} ${onClick ? 'clickable' : ''} ${size}`}
      onClick={onClick ? () => onClick(tag) : undefined}
      style={{ backgroundColor: `${tag.color}15`, borderColor: `${tag.color}60` }}
    >
      <div className="tag-badge-color" style={{ backgroundColor: tag.color }}></div>
      <span className="tag-badge-name" style={{ color: tag.color }}>{tag.name}</span>
      {removable && (
        <button 
          className="tag-badge-remove" 
          onClick={handleRemove}
          aria-label={`Remove ${tag.name} tag`}
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default TagBadge;