import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Key, Smartphone, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

const SecuritySettings: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully');
      reset();
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(twoFactorEnabled ? '2FA disabled' : '2FA enabled');
    } catch (error) {
      toast.error('Failed to update 2FA settings');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Security Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your account security and authentication preferences
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Change Password
          </h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                {...register('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                className="w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                className="w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Update Password'
            )}
          </motion.button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <button
            onClick={handleTwoFactorToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Two-Factor Authentication is enabled
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Your account is protected with an additional security layer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
              Security Recommendations
            </h3>
            <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Use a strong, unique password for your account</li>
              <li>• Enable two-factor authentication for added security</li>
              <li>• Regularly review your account activity</li>
              <li>• Keep your recovery information up to date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;