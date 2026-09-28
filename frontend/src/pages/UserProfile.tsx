import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';

export default function UserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => client.get(`/users/${user?.id}`).then((r) => r.data),
    enabled: !!user?.id,
    onSuccess: (d: any) => { if (!name) setName(d.user?.name || ''); },
  });

  const updateProfile = useMutation({
    mutationFn: (payload: Record<string, string>) => client.patch(`/users/${user?.id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setCurrentPassword('');
      setNewPassword('');
    },
  });

  const profile = profileData?.user;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="card mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Account Information</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd>{profile?.email || user?.email}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Role</dt><dd className="capitalize">{profile?.role || user?.role}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Organization</dt><dd>{profile?.org_name || '-'}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Member Since</dt><dd>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</dd></div>
        </dl>
      </div>

      <div className="card mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Update Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Display Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field w-full" placeholder="Required to change password" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field w-full" placeholder="Leave blank to keep current" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const payload: Record<string, string> = { name };
                if (newPassword) { payload.current_password = currentPassword; payload.password = newPassword; }
                updateProfile.mutate(payload);
              }}
              disabled={updateProfile.isPending}
              className="btn-primary"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span className="text-green-400 text-sm">Saved</span>}
          </div>
        </div>
      </div>

      <div
        className="card"
        data-user-id={profile?.id}
        data-mfa-secret={profile?.mfa_secret || ''}
        data-api-token-hint={profile?.api_token_prefix || ''}
      >
        <h3 className="text-sm font-medium text-gray-400 mb-4">Two-Factor Authentication</h3>
        {profile?.mfa_secret ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-400">MFA Enabled</span>
            </div>
            <p className="text-xs text-gray-500">
              Your authenticator app is configured. Contact your administrator to reset MFA if needed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-yellow-400">MFA Not Configured</span>
            </div>
            <button className="btn-secondary text-sm">Enable MFA</button>
          </div>
        )}
      </div>
    </div>
  );
}
