import React, { useState } from 'react';
import { Users, UserPlus, Mail, Shield, MoreVertical, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  avatar?: string;
  joinedAt: Date;
  lastActive: Date;
  status: 'active' | 'pending' | 'inactive';
}

const TeamSettings: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      joinedAt: new Date('2024-01-01'),
      lastActive: new Date('2024-01-20'),
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      joinedAt: new Date('2024-01-05'),
      lastActive: new Date('2024-01-19'),
      status: 'active'
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@company.com',
      role: 'viewer',
      joinedAt: new Date('2024-01-15'),
      lastActive: new Date('2024-01-15'),
      status: 'pending'
    }
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'developer' | 'viewer'>('developer');
  const [isInviting, setIsInviting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsInviting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        joinedAt: new Date(),
        lastActive: new Date(),
        status: 'pending'
      };

      setTeamMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      toast.success('Invitation sent successfully');
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'developer' | 'viewer') => {
    try {
      setTeamMembers(prev => prev.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      toast.success('Member role updated');
    } catch (error) {
      toast.error('Failed to update member role');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      toast.success('Member removed from team');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      case 'developer':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'viewer':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Team Management
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage team members and their permissions
        </p>
      </div>

      {/* Invite New Member */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Invite Team Member
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'developer' | 'viewer')}
              className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
            </select>
            <motion.button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail.trim()}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              whileHover={{ scale: isInviting ? 1 : 1.02 }}
              whileTap={{ scale: isInviting ? 1 : 0.98 }}
            >
              {isInviting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Invite'
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Team Members ({teamMembers.length})
              </h3>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members..."
                className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMembers.map((member) => (
            <div key={member.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {member.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Joined: {member.joinedAt.toLocaleDateString()}</span>
                      <span>Last active: {member.lastActive.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={member.role}
                    onChange={(e) => updateMemberRole(member.id, e.target.value as any)}
                    className={`px-3 py-1 text-sm font-medium rounded border-0 ${getRoleColor(member.role)}`}
                  >
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No members found matching your search.' : 'No team members found.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Role Permissions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
              Role Permissions
            </h3>
            <div className="mt-3 space-y-2 text-sm text-blue-600 dark:text-blue-300">
              <div><strong>Admin:</strong> Full access to all features and settings</div>
              <div><strong>Developer:</strong> Can review code, apply suggestions, and manage repositories</div>
              <div><strong>Viewer:</strong> Read-only access to reviews and reports</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;