import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TeamDataTable = ({ teams, onViewTeam, onEditTeam, onProcessRefund, onBulkAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('registrationDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [expandedTeam, setExpandedTeam] = useState(null);

  const filteredAndSortedTeams = useMemo(() => {
    if (!teams || teams.length === 0) return [];

    let filtered = teams?.filter(team => {
      const teamName = team?.name || team?.teamName || '';
      const leaderName = team?.user_profiles?.full_name || team?.leaderName || '';
      const matchesSearch = teamName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           leaderName?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesStatus = filterStatus === 'all' || team?.status === filterStatus || team?.paymentStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered?.sort((a, b) => {
      const aValue = a?.[sortField] || a?.created_at || a?.registrationDate;
      const bValue = b?.[sortField] || b?.created_at || b?.registrationDate;
      const direction = sortDirection === 'asc' ? 1 : -1;

      if (sortField === 'registrationDate' || sortField === 'created_at') {
        return direction * (new Date(aValue) - new Date(bValue));
      }

      return direction * aValue?.toString()?.localeCompare(bValue?.toString());
    });
  }, [teams, searchTerm, filterStatus, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev?.includes(teamId) 
        ? prev?.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeams?.length === filteredAndSortedTeams?.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(filteredAndSortedTeams?.map(team => team?.id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-success/20 text-success border-success/30', label: 'Paid' },
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
    <div className="glass rounded-xl border border-border">
      {/* Header Controls */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Input
              type="search"
              placeholder="Search teams or leaders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full sm:w-80"
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="px-4 py-2 bg-input border border-border rounded-lg text-foreground font-inter focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="completed">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {selectedTeams?.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-inter text-muted-foreground">
                {selectedTeams?.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                iconName="Mail"
                onClick={() => onBulkAction('email', selectedTeams)}
              >
                Send Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                onClick={() => onBulkAction('export', selectedTeams)}
              >
                Export
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/5 border-b border-border">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedTeams?.length === filteredAndSortedTeams?.length && filteredAndSortedTeams?.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary"
                />
              </th>
              <th 
                className="p-4 text-left font-inter font-semibold text-foreground cursor-pointer hover:text-primary transition-smooth"
                onClick={() => handleSort('teamName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Team Name</span>
                  <Icon name="ArrowUpDown" size={14} />
                </div>
              </th>
              <th 
                className="p-4 text-left font-inter font-semibold text-foreground cursor-pointer hover:text-primary transition-smooth"
                onClick={() => handleSort('leaderName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Leader</span>
                  <Icon name="ArrowUpDown" size={14} />
                </div>
              </th>
              <th className="p-4 text-left font-inter font-semibold text-foreground">Members</th>
              <th className="p-4 text-left font-inter font-semibold text-foreground">Payment</th>
              <th 
                className="p-4 text-left font-inter font-semibold text-foreground cursor-pointer hover:text-primary transition-smooth"
                onClick={() => handleSort('registrationDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Registered</span>
                  <Icon name="ArrowUpDown" size={14} />
                </div>
              </th>
              <th className="p-4 text-left font-inter font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTeams?.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-inter">No teams found</p>
                    <p className="text-sm">
                      {teams?.length === 0 ? 'No teams have been registered yet.' : 'Try adjusting your search or filters.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedTeams?.map((team) => (
              <React.Fragment key={team?.id}>
                <tr className="border-b border-border hover:bg-white/5 transition-smooth">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedTeams?.includes(team?.id)}
                      onChange={() => handleSelectTeam(team?.id)}
                      className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                        <span className="text-xs font-orbitron font-bold text-white">
                          {(team?.name || team?.teamName)?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-inter font-medium text-foreground">{team?.name || team?.teamName}</p>
                        <p className="text-xs text-muted-foreground">{team?.problem_statements?.title || team?.problemStatement || 'No problem statement'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-inter text-foreground">{team?.user_profiles?.full_name || team?.leaderName || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{team?.user_profiles?.phone_number || team?.leaderPhone || 'No phone'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="Users" size={16} className="text-muted-foreground" />
                      <span className="font-inter text-foreground">{team?.team_members?.length || team?.memberCount || 0}</span>
                      <span className="text-xs text-muted-foreground">
                        members
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {getStatusBadge(team?.status || team?.paymentStatus || 'draft')}
                      <p className="text-sm font-jetbrains text-foreground">
                        {team?.status || 'Draft'}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-inter text-foreground">
                      {new Date(team.registrationDate)?.toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(team.registrationDate)?.toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Eye"
                        onClick={() => setExpandedTeam(expandedTeam === team?.id ? null : team?.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Edit"
                        onClick={() => onEditTeam(team)}
                      />
                      {team?.paymentStatus === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="RefreshCw"
                          onClick={() => onProcessRefund(team)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
                
                {expandedTeam === team?.id && (
                  <tr className="bg-muted/5">
                    <td colSpan="7" className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-inter font-semibold text-foreground mb-3">Team Members</h4>
                          <div className="space-y-2">
                            {team?.members?.map((member, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg">
                                <div>
                                  <p className="font-inter text-foreground">{member?.name}</p>
                                  <p className="text-sm text-muted-foreground">{member?.phone}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-inter ${
                                  member?.gender === 'female' ?'bg-secondary/20 text-secondary' :'bg-primary/20 text-primary'
                                }`}>
                                  {member?.gender === 'female' ? 'F' : 'M'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-inter font-semibold text-foreground mb-3">Payment Details</h4>
                          <div className="space-y-3 p-4 bg-card rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Transaction ID:</span>
                              <span className="font-jetbrains text-foreground">{team?.transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-jetbrains text-foreground">₹{team?.amount?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Payment Date:</span>
                              <span className="text-foreground">
                                {team?.paymentDate ? new Date(team.paymentDate)?.toLocaleDateString('en-IN') : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Method:</span>
                              <span className="text-foreground">{team?.paymentMethod || 'Online'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TeamDataTable;