import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MemberCard = ({ member, onEdit, onRemove, canRemove, isEditing, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    name: member?.name,
    phone: member?.phone,
    role: member?.role
  });

  const handleSave = () => {
    onSave(member?.id, editData);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'leader': return 'Crown';
      case 'developer': return 'Code';
      case 'designer': return 'Palette';
      case 'manager': return 'Users';
      default: return 'User';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'leader': return 'text-warning';
      case 'developer': return 'text-primary';
      case 'designer': return 'text-secondary';
      case 'manager': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  if (isEditing) {
    return (
      <div className="glass rounded-lg p-4 border border-primary/30 neon-glow">
        <div className="space-y-4">
          <Input
            label="Name"
            type="text"
            value={editData?.name}
            onChange={(e) => setEditData({ ...editData, name: e?.target?.value })}
            placeholder="Enter member name"
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={editData?.phone}
            onChange={(e) => setEditData({ ...editData, phone: e?.target?.value })}
            placeholder="Enter phone number"
          />
          
          <div>
            <label className="block text-sm font-inter font-medium text-foreground mb-2">
              Role
            </label>
            <select
              value={editData?.role}
              onChange={(e) => setEditData({ ...editData, role: e?.target?.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground font-inter focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="member">Member</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="default"
              size="sm"
              iconName="Check"
              onClick={handleSave}
              className="flex-1"
            >
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="X"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-4 hover:shadow-cyber transition-smooth group">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center shrink-0">
            <span className="text-sm font-orbitron font-bold text-white">
              {member?.name?.charAt(0) || 'M'}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-inter font-medium text-foreground truncate">
                {member?.name}
              </h3>
              {member?.role === 'leader' && (
                <Icon name="Crown" size={16} className="text-warning shrink-0" />
              )}
            </div>
            
            <p className="text-sm text-muted-foreground font-jetbrains mb-2">
              {member?.phone}
            </p>
            
            <div className="flex items-center space-x-2">
              <Icon 
                name={getRoleIcon(member?.role)} 
                size={14} 
                className={getRoleColor(member?.role)}
              />
              <span className={`text-xs font-inter capitalize ${getRoleColor(member?.role)}`}>
                {member?.role}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-smooth">
          <Button
            variant="ghost"
            size="xs"
            iconName="Edit"
            onClick={() => onEdit(member?.id)}
          />
          {canRemove && (
            <Button
              variant="ghost"
              size="xs"
              iconName="Trash2"
              onClick={() => onRemove(member?.id)}
              className="text-error hover:text-error"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberCard;