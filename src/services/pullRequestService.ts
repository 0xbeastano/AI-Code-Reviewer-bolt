import { Octokit } from '@octokit/rest';
import { supabase, isDemoMode } from '../lib/supabase';
import { authService } from '../lib/auth';
import { AIService } from './aiService';
import { PullRequest, PullRequestFile, PullRequestSummary } from '../types/pullRequest';
import toast from 'react-hot-toast';

class PullRequestService {
  private aiService: AIService;

  constructor() {
    this.aiService = AIService.getInstance();
  }

  async getPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
    try {
      if (isDemoMode()) {
        return this.getMockPullRequests(owner, repo);
      }

      const user = authService.getCurrentUser();
      if (!user || !user.provider_token) {
        throw new Error('GitHub token not available. Please connect your GitHub account.');
      }

      const octokit = new Octokit({
        auth: user.provider_token
      });

      const { data } = await octokit.pulls.list({
        owner,
        repo,
        state: 'open',
        sort: 'updated',
        direction: 'desc',
        per_page: 10
      });

      return data.map(pr => ({
        id: pr.node_id,
        number: pr.number,
        title: pr.title,
        description: pr.body || '',
        author: {
          name: pr.user?.login || 'Unknown',
          avatar: pr.user?.avatar_url || '',
          url: pr.user?.html_url || ''
        },
        repository: {
          name: repo,
          fullName: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`
        },
        baseBranch: pr.base.ref,
        headBranch: pr.head.ref,
        status: pr.merged_at ? 'merged' : pr.state === 'open' ? 'open' : 'closed',
        createdAt: new Date(pr.created_at),
        updatedAt: new Date(pr.updated_at),
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
        closedAt: pr.closed_at ? new Date(pr.closed_at) : undefined,
        commits: pr.commits || 0,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        changedFiles: pr.changed_files || 0,
        url: pr.html_url
      }));
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      toast.error('Failed to fetch pull requests');
      return [];
    }
  }

  async getPullRequestFiles(owner: string, repo: string, pullNumber: number): Promise<PullRequestFile[]> {
    try {
      if (isDemoMode()) {
        return this.getMockPullRequestFiles(owner, repo, pullNumber);
      }

      const user = authService.getCurrentUser();
      if (!user || !user.provider_token) {
        throw new Error('GitHub token not available. Please connect your GitHub account.');
      }

      const octokit = new Octokit({
        auth: user.provider_token
      });

      const { data } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber
      });

      const files: PullRequestFile[] = [];

      for (const file of data) {
        let content = '';
        let language = '';

        // Only fetch content for files that are not deleted and not too large
        if (file.status !== 'removed' && file.changes < 1000) {
          try {
            // Get the file content from the head branch
            const contentResponse = await octokit.repos.getContent({
              owner,
              repo,
              path: file.filename,
              ref: `refs/pull/${pullNumber}/head`
            });

            if ('content' in contentResponse.data && contentResponse.data.content) {
              content = Buffer.from(contentResponse.data.content, 'base64').toString('utf-8');
              
              // Determine language from file extension
              const extension = file.filename.split('.').pop()?.toLowerCase() || '';
              language = this.getLanguageFromExtension(extension);
            }
          } catch (error) {
            console.warn(`Could not fetch content for ${file.filename}:`, error);
          }
        }

        files.push({
          filename: file.filename,
          status: file.status as any,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
          content,
          language
        });
      }

      return files;
    } catch (error) {
      console.error('Error fetching pull request files:', error);
      toast.error('Failed to fetch pull request files');
      return [];
    }
  }

  async generatePullRequestSummary(
    owner: string, 
    repo: string, 
    pullNumber: number, 
    modelId: string = 'gpt-4o'
  ): Promise<PullRequestSummary> {
    try {
      // First get the pull request details
      const prs = await this.getPullRequests(owner, repo);
      const pr = prs.find(p => p.number === pullNumber);
      
      if (!pr) {
        throw new Error(`Pull request #${pullNumber} not found`);
      }
      
      // Then get the files
      const files = await this.getPullRequestFiles(owner, repo, pullNumber);
      
      // Generate a summary using the AI service
      const prompt = this.generatePRSummaryPrompt(pr, files);
      
      if (isDemoMode()) {
        // In demo mode, return a mock summary after a short delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getMockPullRequestSummary(pr.id);
      }
      
      const user = authService.getCurrentUser();
      
      // Call the AI service to generate a summary
      const response = await this.aiService.generatePRSummary(prompt, modelId);
      
      // Save the summary to Supabase if available
      if (supabase && user) {
        try {
          const { data, error } = await supabase
            .from('pull_request_summaries')
            .insert({
              user_id: user.id,
              pull_request_id: pr.id,
              repository: pr.repository.fullName,
              summary: response.summary,
              key_changes: response.keyChanges,
              potential_issues: response.potentialIssues,
              suggested_feedback: response.suggestedFeedback,
              security_considerations: response.securityConsiderations,
              testing_recommendations: response.testingRecommendations,
              model: modelId,
              confidence: response.confidence || 0.85,
              created_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (error) {
            console.error('Error saving PR summary to Supabase:', error);
          }
        } catch (error) {
          console.error('Failed to save PR summary to Supabase:', error);
        }
      }
      
      return {
        id: `pr-summary-${Date.now()}`,
        pullRequestId: pr.id,
        summary: response.summary,
        keyChanges: response.keyChanges,
        potentialIssues: response.potentialIssues,
        suggestedFeedback: response.suggestedFeedback,
        securityConsiderations: response.securityConsiderations,
        testingRecommendations: response.testingRecommendations,
        generatedAt: new Date(),
        model: modelId,
        confidence: response.confidence || 0.85
      };
    } catch (error) {
      console.error('Error generating pull request summary:', error);
      toast.error('Failed to generate pull request summary');
      
      // Return a basic error summary
      return {
        id: `pr-summary-error-${Date.now()}`,
        pullRequestId: '',
        summary: 'Failed to generate summary due to an error.',
        keyChanges: [],
        potentialIssues: [],
        suggestedFeedback: [],
        securityConsiderations: [],
        testingRecommendations: [],
        generatedAt: new Date(),
        model: modelId,
        confidence: 0
      };
    }
  }

  private generatePRSummaryPrompt(pr: PullRequest, files: PullRequestFile[]): string {
    // Create a comprehensive prompt for the AI to generate a PR summary
    const fileDetails = files.map(file => {
      let fileInfo = `File: ${file.filename} (${file.status}, +${file.additions}, -${file.deletions})`;
      
      if (file.patch) {
        fileInfo += `\nChanges:\n\`\`\`diff\n${file.patch}\n\`\`\``;
      }
      
      if (file.content && file.content.length < 5000) {
        fileInfo += `\nFull content:\n\`\`\`${file.language || ''}\n${file.content}\n\`\`\``;
      }
      
      return fileInfo;
    }).join('\n\n');

    return `
Please analyze this pull request and provide a comprehensive review summary:

## Pull Request Information
- Title: ${pr.title}
- Description: ${pr.description || 'No description provided'}
- Author: ${pr.author.name}
- Base Branch: ${pr.baseBranch}
- Head Branch: ${pr.headBranch}
- Changed Files: ${pr.changedFiles}
- Additions: ${pr.additions}
- Deletions: ${pr.deletions}
- Commits: ${pr.commits}

## Files Changed
${fileDetails}

Please provide a detailed analysis in JSON format with the following structure:
{
  "summary": "A concise but comprehensive summary of the changes",
  "keyChanges": [
    "List of the most important changes made in this PR",
    "..."
  ],
  "potentialIssues": [
    "Any potential bugs, edge cases, or issues you identify",
    "..."
  ],
  "suggestedFeedback": [
    "Constructive feedback for the author",
    "..."
  ],
  "securityConsiderations": [
    "Any security implications of these changes",
    "..."
  ],
  "testingRecommendations": [
    "Suggestions for how to test these changes",
    "..."
  ],
  "confidence": 0.95
}

Focus on providing actionable insights that would help a reviewer understand the changes quickly and thoroughly.
`;
  }

  private getLanguageFromExtension(extension: string): string {
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'dart': 'dart',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'vue': 'vue',
      'svelte': 'svelte',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
    };
    
    return languageMap[extension] || 'text';
  }

  // Mock data methods for demo mode
  private getMockPullRequests(owner: string, repo: string): PullRequest[] {
    return [
      {
        id: 'PR_mock_1',
        number: 123,
        title: 'Add user authentication feature',
        description: 'This PR implements user authentication using JWT tokens and adds login/signup forms.',
        author: {
          name: 'johndoe',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          url: 'https://github.com/johndoe'
        },
        repository: {
          name: repo,
          fullName: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`
        },
        baseBranch: 'main',
        headBranch: 'feature/user-auth',
        status: 'open',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        commits: 5,
        additions: 350,
        deletions: 21,
        changedFiles: 8,
        url: `https://github.com/${owner}/${repo}/pull/123`
      },
      {
        id: 'PR_mock_2',
        number: 124,
        title: 'Fix security vulnerability in API endpoints',
        description: 'This PR addresses a critical security issue in our API authentication middleware.',
        author: {
          name: 'janesmith',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          url: 'https://github.com/janesmith'
        },
        repository: {
          name: repo,
          fullName: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`
        },
        baseBranch: 'main',
        headBranch: 'fix/security-issue',
        status: 'open',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        commits: 2,
        additions: 45,
        deletions: 12,
        changedFiles: 3,
        url: `https://github.com/${owner}/${repo}/pull/124`
      },
      {
        id: 'PR_mock_3',
        number: 125,
        title: 'Improve performance of dashboard components',
        description: 'This PR optimizes the rendering of dashboard components and reduces API calls.',
        author: {
          name: 'alexchen',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          url: 'https://github.com/alexchen'
        },
        repository: {
          name: repo,
          fullName: `${owner}/${repo}`,
          url: `https://github.com/${owner}/${repo}`
        },
        baseBranch: 'main',
        headBranch: 'feature/dashboard-perf',
        status: 'open',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        commits: 8,
        additions: 215,
        deletions: 187,
        changedFiles: 12,
        url: `https://github.com/${owner}/${repo}/pull/125`
      }
    ];
  }

  private getMockPullRequestFiles(owner: string, repo: string, pullNumber: number): PullRequestFile[] {
    // Different mock files based on the PR number
    if (pullNumber === 123) {
      return [
        {
          filename: 'src/components/Auth/LoginForm.tsx',
          status: 'added',
          additions: 120,
          deletions: 0,
          changes: 120,
          patch: '@@ -0,0 +1,120 @@\n+import React, { useState } from \'react\';\n+import { useForm } from \'react-hook-form\';\n+import { zodResolver } from \'@hookform/resolvers/zod\';\n+import { z } from \'zod\';\n+import { motion } from \'framer-motion\';\n+import { Eye, EyeOff, Mail, Lock, Github, Chrome, Loader2 } from \'lucide-react\';\n+import { useAuth } from \'./AuthProvider\';\n+import toast from \'react-hot-toast\';\n+import { useNavigate } from \'react-router-dom\';\n+\n+const loginSchema = z.object({\n+  email: z.string().email(\'Invalid email address\'),\n+  password: z.string().min(6, \'Password must be at least 6 characters\')\n+});\n+\n+type LoginForm = z.infer<typeof loginSchema>;\n+\n+interface LoginFormProps {\n+  onSwitchToSignup: () => void;\n+  onSwitchToReset: () => void;\n+}\n+\n+export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onSwitchToReset }) => {\n+  const { signIn, signInWithGitHub, signInWithGoogle } = useAuth();\n+  const [showPassword, setShowPassword] = useState(false);\n+  const [isLoading, setIsLoading] = useState(false);\n+  const [oauthLoading, setOauthLoading] = useState<\'github\' | \'google\' | null>(null);\n+  const navigate = useNavigate();\n+\n+  const {\n+    register,\n+    handleSubmit,\n+    formState: { errors }\n+  } = useForm<LoginForm>({\n+    resolver: zodResolver(loginSchema)\n+  });\n+\n+  const onSubmit = async (data: LoginForm) => {\n+    setIsLoading(true);\n+    try {\n+      const { error } = await signIn(data.email, data.password);\n+      \n+      if (error) {\n+        toast.error(error.message);\n+      } else {\n+        toast.success(\'Welcome back!\');\n+        navigate(\'/dashboard\');\n+      }\n+    } catch (error) {\n+      toast.error(\'An unexpected error occurred\');\n+    } finally {\n+      setIsLoading(false);\n+    }\n+  };\n+\n+  const handleGitHubSignIn = async () => {\n+    setOauthLoading(\'github\');\n+    try {\n+      // Store current location for redirect after auth\n+      sessionStorage.setItem(\'auth_return_to\', \'/dashboard\');\n+      \n+      const { error } = await signInWithGitHub();\n+      \n+      if (error) {\n+        toast.error(error.message);\n+      }\n+      // Redirect is handled in the signInWithGitHub function\n+    } catch (error) {\n+      toast.error(\'Failed to sign in with GitHub\');\n+    } finally {\n+      setOauthLoading(null);\n+    }\n+  };\n+\n+  const handleGoogleSignIn = async () => {\n+    setOauthLoading(\'google\');\n+    try {\n+      // Store current location for redirect after auth\n+      sessionStorage.setItem(\'auth_return_to\', \'/dashboard\');\n+      \n+      const { error } = await signInWithGoogle();\n+      \n+      if (error) {\n+        toast.error(error.message);\n+      }\n+      // Redirect is handled in the signInWithGoogle function\n+    } catch (error) {\n+      toast.error(\'Failed to sign in with Google\');\n+    } finally {\n+      setOauthLoading(null);\n+    }\n+  };\n+\n+  return (\n+    // Form implementation\n+  );\n+};',
          content: `import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Github, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSwitchToReset: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onSwitchToReset }) => {
  const { signIn, signInWithGitHub, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setOauthLoading('github');
    try {
      // Store current location for redirect after auth
      sessionStorage.setItem('auth_return_to', '/dashboard');
      
      const { error } = await signInWithGitHub();
      
      if (error) {
        toast.error(error.message);
      }
      // Redirect is handled in the signInWithGitHub function
    } catch (error) {
      toast.error('Failed to sign in with GitHub');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    try {
      // Store current location for redirect after auth
      sessionStorage.setItem('auth_return_to', '/dashboard');
      
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast.error(error.message);
      }
      // Redirect is handled in the signInWithGoogle function
    } catch (error) {
      toast.error('Failed to sign in with Google');
    } finally {
      setOauthLoading(null);
    }
  };

  // Form implementation
}`,
          language: 'typescript'
        },
        {
          filename: 'src/components/Auth/SignupForm.tsx',
          status: 'added',
          additions: 150,
          deletions: 0,
          changes: 150,
          patch: '@@ -0,0 +1,150 @@\n+import React, { useState } from \'react\';\n+import { useForm } from \'react-hook-form\';\n+import { zodResolver } from \'@hookform/resolvers/zod\';\n+import { z } from \'zod\';\n+import { motion } from \'framer-motion\';\n+import { Eye, EyeOff, Mail, Lock, User, Github, Chrome, Loader2 } from \'lucide-react\';\n+import { useAuth } from \'./AuthProvider\';\n+import toast from \'react-hot-toast\';\n+import { useNavigate } from \'react-router-dom\';\n+\n+const signupSchema = z.object({\n+  name: z.string().min(2, \'Name must be at least 2 characters\'),\n+  email: z.string().email(\'Invalid email address\'),\n+  password: z.string()\n+    .min(8, \'Password must be at least 8 characters\')\n+    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, \'Password must contain at least one uppercase letter, one lowercase letter, and one number\'),\n+  confirmPassword: z.string()\n+}).refine((data) => data.password === data.confirmPassword, {\n+  message: \"Passwords don\'t match\",\n+  path: [\"confirmPassword\"],\n+});\n+\n+type SignupForm = z.infer<typeof signupSchema>;\n+\n+interface SignupFormProps {\n+  onSwitchToLogin: () => void;\n+}\n+\n+export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {\n+  const { signUp, signInWithGitHub, signInWithGoogle } = useAuth();\n+  const [showPassword, setShowPassword] = useState(false);\n+  const [showConfirmPassword, setShowConfirmPassword] = useState(false);\n+  const [isLoading, setIsLoading] = useState(false);\n+  const [oauthLoading, setOauthLoading] = useState<\'github\' | \'google\' | null>(null);\n+  const [emailSent, setEmailSent] = useState(false);\n+  const navigate = useNavigate();\n+\n+  const {\n+    register,\n+    handleSubmit,\n+    formState: { errors },\n+    watch\n+  } = useForm<SignupForm>({\n+    resolver: zodResolver(signupSchema)\n+  });\n+\n+  const password = watch(\'password\');\n+\n+  const onSubmit = async (data: SignupForm) => {\n+    setIsLoading(true);\n+    try {\n+      const { error } = await signUp(data.email, data.password);\n+      \n+      if (error) {\n+        if (error.message.includes(\'verification link\')) {\n+          setEmailSent(true);\n+          toast.success(\'Verification email sent! Please check your inbox.\');\n+        } else {\n+          toast.error(error.message);\n+        }\n+      } else {\n+        toast.success(\'Account created successfully!\');\n+        navigate(\'/dashboard\');\n+      }\n+    } catch (error) {\n+      toast.error(\'An unexpected error occurred\');\n+    } finally {\n+      setIsLoading(false);\n+    }\n+  };\n+\n+  const handleGitHubSignIn = async () => {\n+    setOauthLoading(\'github\');\n+    try {\n+      // Store current location for redirect after auth\n+      sessionStorage.setItem(\'auth_return_to\', \'/dashboard\');\n+      \n+      const { error } = await signInWithGitHub();\n+      \n+      if (error) {\n+        toast.error(error.message);\n+      }\n+      // Redirect is handled in the signInWithGitHub function\n+    } catch (error) {\n+      toast.error(\'Failed to sign up with GitHub\');\n+    } finally {\n+      setOauthLoading(null);\n+    }\n+  };\n+\n+  const handleGoogleSignIn = async () => {\n+    setOauthLoading(\'google\');\n+    try {\n+      // Store current location for redirect after auth\n+      sessionStorage.setItem(\'auth_return_to\', \'/dashboard\');\n+      \n+      const { error } = await signInWithGoogle();\n+      \n+      if (error) {\n+        toast.error(error.message);\n+      }\n+      // Redirect is handled in the signInWithGoogle function\n+    } catch (error) {\n+      toast.error(\'Failed to sign up with Google\');\n+    } finally {\n+      setOauthLoading(null);\n+    }\n+  };\n+\n+  // Form implementation\n+}',
          content: `import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Github, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { signUp, signInWithGitHub, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  });

  const password = watch('password');

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password);
      
      if (error) {
        if (error.message.includes('verification link')) {
          setEmailSent(true);
          toast.success('Verification email sent! Please check your inbox.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setOauthLoading('github');
    try {
      // Store current location for redirect after auth
      sessionStorage.setItem('auth_return_to', '/dashboard');
      
      const { error } = await signInWithGitHub();
      
      if (error) {
        toast.error(error.message);
      }
      // Redirect is handled in the signInWithGitHub function
    } catch (error) {
      toast.error('Failed to sign up with GitHub');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    try {
      // Store current location for redirect after auth
      sessionStorage.setItem('auth_return_to', '/dashboard');
      
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast.error(error.message);
      }
      // Redirect is handled in the signInWithGoogle function
    } catch (error) {
      toast.error('Failed to sign up with Google');
    } finally {
      setOauthLoading(null);
    }
  };

  // Form implementation
}`,
          language: 'typescript'
        },
        {
          filename: 'src/components/Auth/AuthProvider.tsx',
          status: 'modified',
          additions: 80,
          deletions: 10,
          changes: 90,
          patch: '@@ -1,6 +1,7 @@\n import React, { createContext, useContext, useEffect, useState } from \'react\';\n import { User, Session } from \'@supabase/supabase-js\';\n import { supabase, isDemoMode } from \'../../lib/supabase\';\n+import toast from \'react-hot-toast\';\n \n interface AuthContextType {\n   user: User | null;\n@@ -10,6 +11,8 @@ interface AuthContextType {\n   signIn: (email: string, password: string) => Promise<{ error: any }>;\n   signUp: (email: string, password: string) => Promise<{ error: any }>;\n   signOut: () => Promise<void>;\n+  signInWithGitHub: () => Promise<{ error: any; url?: string }>;\n+  signInWithGoogle: () => Promise<{ error: any; url?: string }>;\n   resetPassword: (email: string) => Promise<{ error: any }>;\n }\n \n@@ -112,12 +115,72 @@ export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ childre\n   const resetPassword = async (email: string) => {\n     if (isDemoMode() || !supabase) {\n       console.log(\'🔄 Demo mode: Password reset simulated\');\n       return { error: null };\n     }\n \n     try {\n       const { error } = await supabase.auth.resetPasswordForEmail(email, {\n-        redirectTo: `${window.location.origin}/reset-password`,\n+        redirectTo: `${window.location.origin}/auth/reset-password`,\n       });\n       return { error };\n     } catch (error) {\n       console.error(\'Reset password error:\', error);\n       return { error };\n     }\n   };\n+\n+  const signInWithGitHub = async () => {\n+    if (isDemoMode() || !supabase) {\n+      console.log(\'🔄 Demo mode: GitHub sign in simulated\');\n+      return { error: null };\n+    }\n+\n+    try {\n+      const { data, error } = await supabase.auth.signInWithOAuth({\n+        provider: \'github\',\n+        options: {\n+          redirectTo: `${window.location.origin}/auth/callback`,\n+          scopes: \'repo user:email read:user\'\n+        },\n+      });\n+      \n+      if (error) {\n+        toast.error(`GitHub sign in failed: ${error.message}`);\n+        return { error };\n+      }\n+      \n+      if (data.url) {\n+        window.location.href = data.url;\n+      }\n+      \n+      return { url: data.url, error: null };\n+    } catch (error) {\n+      console.error(\'GitHub sign in error:\', error);\n+      toast.error(\'Failed to sign in with GitHub\');\n+      return { error };\n+    }\n+  };\n+\n+  const signInWithGoogle = async () => {\n+    if (isDemoMode() || !supabase) {\n+      console.log(\'🔄 Demo mode: Google sign in simulated\');\n+      return { error: null };\n+    }\n+\n+    try {\n+      const { data, error } = await supabase.auth.signInWithOAuth({\n+        provider: \'google\',\n+        options: {\n+          redirectTo: `${window.location.origin}/auth/callback`,\n+        },\n+      });\n+      \n+      if (error) {\n+        toast.error(`Google sign in failed: ${error.message}`);\n+        return { error };\n+      }\n+      \n+      if (data.url) {\n+        window.location.href = data.url;\n+      }\n+      \n+      return { url: data.url, error: null };\n+    } catch (error) {\n+      console.error(\'Google sign in error:\', error);\n+      toast.error(\'Failed to sign in with Google\');\n+      return { error };\n+    }\n+  };\n \n   const value = {\n     user,\n@@ -127,6 +190,8 @@ export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ childre\n     signIn,\n     signUp,\n     signOut,\n+    signInWithGitHub,\n+    signInWithGoogle,\n     resetPassword,\n   };\n ',
          content: `import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGitHub: () => Promise<{ error: any; url?: string }>;
  signInWithGoogle: () => Promise<{ error: any; url?: string }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If in demo mode or Supabase client not available, set up demo state
    if (isDemoMode() || !supabase) {
      console.log('🔄 Running in demo mode - authentication disabled');
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Sign in simulated');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Sign up simulated');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Sign out simulated');
      setUser(null);
      setSession(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Password reset simulated');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: \`${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const signInWithGitHub = async () => {
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: GitHub sign in simulated');
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: \`${window.location.origin}/auth/callback`,
          scopes: 'repo user:email read:user'
        },
      });
      
      if (error) {
        toast.error(\`GitHub sign in failed: ${error.message}`);
        return { error };
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
      
      return { url: data.url, error: null };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      toast.error('Failed to sign in with GitHub');
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    if (isDemoMode() || !supabase) {
      console.log('🔄 Demo mode: Google sign in simulated');
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: \`${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        toast.error(\`Google sign in failed: ${error.message}`);
        return { error };
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
      
      return { url: data.url, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google');
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGitHub,
    signInWithGoogle,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};`,
          language: 'typescript'
        }
      ];
    } else if (pullNumber === 124) {
      return [
        {
          filename: 'src/middleware/auth.js',
          status: 'modified',
          additions: 25,
          deletions: 8,
          changes: 33,
          patch: '@@ -1,15 +1,32 @@\n const jwt = require(\'jsonwebtoken\');\n \n-function authenticate(req, res, next) {\n+function authenticate(req, res, next) {\n+  // Check if the request has an authorization header\n   const authHeader = req.headers.authorization;\n-  if (!authHeader) {\n+  \n+  if (!authHeader || !authHeader.startsWith(\'Bearer \')) {\n     return res.status(401).json({ error: \'No token provided\' });\n   }\n \n-  const token = authHeader.split(\' \')[1];\n+  // Extract the token from the Authorization header\n+  const token = authHeader.replace(\'Bearer \', \'\');\n+  \n+  if (!token) {\n+    return res.status(401).json({ error: \'Invalid token format\' });\n+  }\n+  \n   try {\n-    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n-    req.user = decoded;\n+    // Verify the token with the secret key\n+    const decoded = jwt.verify(token, process.env.JWT_SECRET, {\n+      algorithms: [\'HS256\'], // Only allow specific algorithms\n+      maxAge: \'1h\' // Token expires after 1 hour\n+    });\n+    \n+    // Check if the token has the required claims\n+    if (!decoded.sub || !decoded.iat) {\n+      return res.status(401).json({ error: \'Invalid token claims\' });\n+    }\n+    \n+    // Set the user information in the request object\n+    req.user = {\n+      id: decoded.sub,\n+      roles: decoded.roles || [],\n+      iat: decoded.iat\n+    };\n+    \n     next();\n   } catch (error) {\n-    return res.status(401).json({ error: \'Invalid token\' });\n+    // Handle different types of JWT errors\n+    if (error.name === \'TokenExpiredError\') {\n+      return res.status(401).json({ error: \'Token expired\' });\n+    } else if (error.name === \'JsonWebTokenError\') {\n+      return res.status(401).json({ error: \'Invalid token\' });\n+    }\n+    return res.status(500).json({ error: \'Authentication error\' });\n   }\n }\n ',
          content: `const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  // Check if the request has an authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  try {
    // Verify the token with the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Only allow specific algorithms
      maxAge: '1h' // Token expires after 1 hour
    });
    
    // Check if the token has the required claims
    if (!decoded.sub || !decoded.iat) {
      return res.status(401).json({ error: 'Invalid token claims' });
    }
    
    // Set the user information in the request object
    req.user = {
      id: decoded.sub,
      roles: decoded.roles || [],
      iat: decoded.iat
    };
    
    next();
  } catch (error) {
    // Handle different types of JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
}`,
          language: 'javascript'
        },
        {
          filename: 'src/controllers/authController.js',
          status: 'modified',
          additions: 20,
          deletions: 4,
          changes: 24,
          patch: '@@ -1,12 +1,28 @@\n const jwt = require(\'jsonwebtoken\');\n const bcrypt = require(\'bcrypt\');\n const User = require(\'../models/User\');\n+const crypto = require(\'crypto\');\n \n-exports.login = async (req, res) => {\n+// Generate a secure random token for CSRF protection\n+function generateCSRFToken() {\n+  return crypto.randomBytes(32).toString(\'hex\');\n+}\n+\n+// Set security headers for all auth responses\n+function setSecurityHeaders(res) {\n+  res.set(\'X-Content-Type-Options\', \'nosniff\');\n+  res.set(\'X-Frame-Options\', \'DENY\');\n+  res.set(\'Content-Security-Policy\', \"default-src \'self\'\");\n+  res.set(\'Cache-Control\', \'no-store\');\n+  res.set(\'Pragma\', \'no-cache\');\n+}\n+\n+exports.login = async (req, res) => {\n   try {\n     const { email, password } = req.body;\n \n+    // Validate input\n+    if (!email || !password) {\n+      return res.status(400).json({ error: \'Email and password are required\' });\n+    }\n+\n     // Find user by email\n     const user = await User.findOne({ email });\n     if (!user) {\n@@ -18,9 +34,9 @@ exports.login = async (req, res) => {\n     if (!isValidPassword) {\n       return res.status(401).json({ error: \'Invalid credentials\' });\n     }\n \n     // Generate JWT token\n-    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: \'1h\' });\n+    const token = jwt.sign({ sub: user._id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: \'1h\', algorithm: \'HS256\' });\n \n+    setSecurityHeaders(res);\n     res.json({ token });\n   } catch (error) {\n     res.status(500).json({ error: error.message });\n',
          content: `const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');

// Generate a secure random token for CSRF protection
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Set security headers for all auth responses
function setSecurityHeaders(res) {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Content-Security-Policy', "default-src 'self'");
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ sub: user._id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });

    setSecurityHeaders(res);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}`,
          language: 'javascript'
        }
      ];
    } else {
      return [
        {
          filename: 'src/components/Dashboard/MetricCard.tsx',
          status: 'modified',
          additions: 45,
          deletions: 20,
          changes: 65,
          patch: '@@ -1,40 +1,65 @@\n import React from \'react\';\n-import { motion } from \'framer-motion\';\n+import { motion, useAnimation } from \'framer-motion\';\n import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from \'lucide-react\';\n+import { useInView } from \'react-intersection-observer\';\n+import { useEffect } from \'react\';\n \n interface MetricCardProps {\n   title: string;\n   value: string | number;\n   icon: LucideIcon;\n   color: \'blue\' | \'green\' | \'red\' | \'orange\' | \'purple\';\n   trend?: {\n     value: number;\n     direction: \'up\' | \'down\' | \'stable\';\n   };\n   loading?: boolean;\n   subtitle?: string;\n   badge?: string;\n+  animate?: boolean;\n }\n \n const MetricCard: React.FC<MetricCardProps> = ({\n   title,\n   value,\n   icon: Icon,\n   color,\n   trend,\n   loading = false,\n   subtitle,\n-  badge\n+  badge,\n+  animate = true\n }) => {\n+  const controls = useAnimation();\n+  const [ref, inView] = useInView({\n+    triggerOnce: true,\n+    threshold: 0.1\n+  });\n+\n+  useEffect(() => {\n+    if (inView) {\n+      controls.start(\'visible\');\n+    }\n+  }, [controls, inView]);\n+\n   const colorClasses = {\n     blue: \'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800\',\n     green: \'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800\',\n     red: \'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800\',\n     orange: \'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800\',\n     purple: \'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800\'\n   };\n \n+  const variants = {\n+    hidden: { opacity: 0, y: 20 },\n+    visible: { \n+      opacity: 1, \n+      y: 0,\n+      transition: {\n+        duration: 0.5,\n+        ease: \'easeOut\'\n+      }\n+    }\n+  };\n+\n+  const numberVariants = {\n+    hidden: { scale: 0.5, opacity: 0 },\n+    visible: { \n+      scale: 1, \n+      opacity: 1,\n+      transition: {\n+        type: \'spring\',\n+        stiffness: 400,\n+        damping: 10,\n+        delay: 0.2\n+      }\n+    }\n+  };\n+\n   if (loading) {\n     return (\n       <div className=\"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6\">\n@@ -47,9 +72,9 @@ const MetricCard: React.FC<MetricCardProps> = ({\n   }\n \n   return (\n-    <motion.div\n-      initial={{ opacity: 0, y: 20 }}\n-      animate={{ opacity: 1, y: 0 }}\n+    <motion.div\n+      ref={ref}\n+      variants={animate ? variants : undefined}\n+      initial={animate ? \'hidden\' : undefined}\n+      animate={animate ? controls : undefined}\n       whileHover={{ y: -5, scale: 1.02 }}\n       className=\"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-xl cursor-pointer\"\n     >\n@@ -78,9 +103,9 @@ const MetricCard: React.FC<MetricCardProps> = ({\n       </div>\n       \n       <div>\n-        <motion.p \n-          className=\"text-2xl font-bold text-gray-900 dark:text-white mb-1\"\n-          initial={{ scale: 0.9 }}\n-          animate={{ scale: 1 }}\n-          transition={{ type: \"spring\", stiffness: 400, damping: 10 }}\n+        <motion.p \n+          className=\"text-2xl font-bold text-gray-900 dark:text-white mb-1\"\n+          variants={animate ? numberVariants : undefined}\n+          initial={animate ? \'hidden\' : undefined}\n+          animate={animate ? controls : undefined}\n         >\n           {value}\n         </motion.p>',
          content: `import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  loading?: boolean;
  subtitle?: string;
  badge?: string;
  animate?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  loading = false,
  subtitle,
  badge,
  animate = true
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const numberVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
        delay: 0.2
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="w-20 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={animate ? variants : undefined}
      initial={animate ? 'hidden' : undefined}
      animate={animate ? controls : undefined}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-xl cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          className={\`p-3 rounded-lg border ${colorClasses[color]}`}
          whileHover={{ rotate: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
        
        <div className="flex items-center space-x-2">
          {badge && (
            <motion.span 
              className="text-xs px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-medium"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [-1, 1, -1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {badge}
            </motion.span>
          )}
          {trend && (
            <div className={\`flex items-center space-x-1 text-sm font-medium ${
              trend.direction === 'up' 
                ? 'text-green-600 dark:text-green-400' 
                : trend.direction === 'down'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
              {trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
              <span>+{trend.value}%</span>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <motion.p 
          className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
          variants={animate ? numberVariants : undefined}
          initial={animate ? 'hidden' : undefined}
          animate={animate ? controls : undefined}
        >
          {value}
        </motion.p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;`,
          language: 'typescript'
        },
        {
          filename: 'src/components/Dashboard/QualityTrends.tsx',
          status: 'modified',
          additions: 30,
          deletions: 15,
          changes: 45,
          patch: '@@ -1,5 +1,5 @@\n import React from \'react\';\n-import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from \'recharts\';\n+import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from \'recharts\';\n import { motion } from \'framer-motion\';\n import { BarChart3, ChevronRight } from \'lucide-react\';\n \n@@ -10,6 +10,7 @@ interface QualityTrendsProps {\n     performance: number[];\n     // New expanded metrics\n     maintainability?: number[];\n+    complexity?: number[];\n     testCoverage?: number[];\n     documentation?: number[];\n   };\n@@ -30,6 +31,11 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n     const stepIndex = Math.floor((progress / 100) * analysisSteps.length);\n     setCurrentAnalysisStep(analysisSteps[Math.min(stepIndex, analysisSteps.length - 1)]);\n   }, [progress]);\n+\n+  // Calculate the average quality score\n+  const averageQuality = data ? Math.round(\n+    data.quality.reduce((sum, val) => sum + val, 0) / data.quality.length\n+  ) : 0;\n   \n   // Transform data for chart\n   const chartData = data.quality.map((quality, index) => {\n@@ -40,6 +46,9 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n     \n     // Add new metrics if available\n     if (data.maintainability) dataPoint.maintainability = data.maintainability[index];\n+    if (data.complexity) {\n+      dataPoint.complexity = data.complexity[index];\n+    }\n     if (data.testCoverage) dataPoint.testCoverage = data.testCoverage[index];\n     if (data.documentation) dataPoint.documentation = data.documentation[index];\n     \n@@ -47,7 +56,7 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n   });\n \n   return (\n-    <motion.div\n+    <motion.div\n       initial={{ opacity: 0, y: 20 }}\n       animate={{ opacity: 1, y: 0 }}\n       className=\"bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700\"\n@@ -67,7 +76,7 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n       </div>\n \n       <div className=\"p-6\">\n-        <motion.div \n+        <motion.div \n           className=\"h-64\"\n           initial={{ opacity: 0 }}\n           animate={{ opacity: 1 }}\n@@ -75,7 +84,7 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n         >\n           <ResponsiveContainer width=\"100%\" height=\"100%\">\n             <LineChart data={chartData}>\n-              <CartesianGrid strokeDasharray=\"3 3\" className=\"opacity-30\" />\n+              <CartesianGrid strokeDasharray=\"3 3\" className=\"opacity-20\" />\n               <XAxis \n                 dataKey=\"day\" \n                 className=\"text-xs\"\n@@ -83,7 +92,7 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n               />\n               <YAxis \n                 className=\"text-xs\"\n-                tick={{ fill: \'currentColor\' }}\n+                tick={{ fill: \'currentColor\' }}\n                 domain={[0, 100]}\n               />\n               <Tooltip \n@@ -91,7 +100,7 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n                   backgroundColor: \'var(--tooltip-bg)\',\n                   border: \'1px solid var(--tooltip-border)\',\n                   borderRadius: \'8px\',\n-                  color: \'var(--tooltip-color)\'\n+                  color: \'var(--tooltip-color)\'\n                 }}\n                 animationDuration={300}\n               />\n@@ -99,7 +108,7 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n               <Line \n                 type=\"monotone\" \n                 dataKey=\"quality\" \n-                stroke=\"#3B82F6\" \n+                stroke=\"#3B82F6\"\n                 strokeWidth={2}\n                 dot={{ fill: \'#3B82F6\', strokeWidth: 2, r: 4 }}\n                 name=\"Quality\"\n@@ -111,7 +120,7 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n               <Line \n                 type=\"monotone\" \n                 dataKey=\"security\" \n-                stroke=\"#10B981\" \n+                stroke=\"#10B981\"\n                 strokeWidth={2}\n                 dot={{ fill: \'#10B981\', strokeWidth: 2, r: 4 }}\n                 name=\"Security\"\n@@ -123,7 +132,7 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n               <Line \n                 type=\"monotone\" \n                 dataKey=\"performance\" \n-                stroke=\"#F59E0B\" \n+                stroke=\"#F59E0B\"\n                 strokeWidth={2}\n                 dot={{ fill: \'#F59E0B\', strokeWidth: 2, r: 4 }}\n                 name=\"Performance\"\n@@ -135,7 +144,7 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n               {data.maintainability && (\n                 <Line \n                   type=\"monotone\" \n-                  dataKey=\"maintainability\" \n+                  dataKey=\"maintainability\"\n                   stroke=\"#8B5CF6\" \n                   strokeWidth={2}\n                   dot={{ fill: \'#8B5CF6\', strokeWidth: 2, r: 4 }}\n@@ -146,6 +155,15 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n                   animationBegin={900}\n                 />\n               )}\n+              {data.complexity && (\n+                <Line \n+                  type=\"monotone\" \n+                  dataKey=\"complexity\"\n+                  stroke=\"#EC4899\" \n+                  strokeWidth={2}\n+                  dot={{ fill: \'#EC4899\', strokeWidth: 2, r: 4 }}\n+                  name=\"Complexity\"\n+                  activeDot={{ r: 6, stroke: \'#EC4899\', strokeWidth: 2 }}\n+                  animationDuration={1500}\n+                  animationEasing=\"ease-in-out\"\n+                  animationBegin={1200}\n+                />\n+              )}\n               {data.testCoverage && (\n                 <Line \n                   type=\"monotone\" \n@@ -162,6 +180,18 @@ const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {\n             </LineChart>\n           </ResponsiveContainer>\n         </motion.div>\n+        \n+        {/* Quality Score Card */}\n+        <motion.div\n+          initial={{ opacity: 0, y: 20 }}\n+          animate={{ opacity: 1, y: 0 }}\n+          transition={{ delay: 0.5 }}\n+          className=\"mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between\"\n+        >\n+          <div className=\"text-sm font-medium text-blue-800 dark:text-blue-200\">Average Quality Score</div>\n+          <div className=\"text-2xl font-bold text-blue-600 dark:text-blue-400\">{averageQuality}%</div>\n+        </motion.div>\n       </div>\n     </motion.div>\n   );\n',
          content: `import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, ChevronRight } from 'lucide-react';

interface QualityTrendsProps {
  data?: {
    quality: number[];
    security: number[];
    performance: number[];
    // New expanded metrics
    maintainability?: number[];
    complexity?: number[];
    testCoverage?: number[];
    documentation?: number[];
  };
}

const QualityTrends: React.FC<QualityTrendsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  // Calculate the average quality score
  const averageQuality = data ? Math.round(
    data.quality.reduce((sum, val) => sum + val, 0) / data.quality.length
  ) : 0;
  
  // Transform data for chart
  const chartData = data.quality.map((quality, index) => {
    const dataPoint: any = {
      day: \`Day ${index + 1}`,
      quality,
      security: data.security[index],
      performance: data.performance[index],
    };
    
    // Add new metrics if available
    if (data.maintainability) dataPoint.maintainability = data.maintainability[index];
    if (data.complexity) {
      dataPoint.complexity = data.complexity[index];
    }
    if (data.testCoverage) dataPoint.testCoverage = data.testCoverage[index];
    if (data.documentation) dataPoint.documentation = data.documentation[index];
    
    return dataPoint;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quality Trends
            </h3>
          </motion.div>
          <motion.button 
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            View details
            <ChevronRight className="w-4 h-4 ml-1" />
          </motion.button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Code quality metrics over time
        </p>
      </div>

      <div className="p-6">
        <motion.div 
          className="h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis 
                dataKey="day" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-color)'
                }}
                animationDuration={300}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="quality" 
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Quality"
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Line 
                type="monotone" 
                dataKey="security" 
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Security"
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
                animationBegin={300}
              />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Performance"
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
                animationBegin={600}
              />
              {data.maintainability && (
                <Line 
                  type="monotone" 
                  dataKey="maintainability"
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="Maintainability"
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={900}
                />
              )}
              {data.complexity && (
                <Line 
                  type="monotone" 
                  dataKey="complexity"
                  stroke="#EC4899" 
                  strokeWidth={2}
                  dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                  name="Complexity"
                  activeDot={{ r: 6, stroke: '#EC4899', strokeWidth: 2 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={1200}
                />
              )}
              {data.testCoverage && (
                <Line 
                  type="monotone" 
                  dataKey="testCoverage" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                  name="Test Coverage"
                  activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  animationBegin={1500}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        
        {/* Quality Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between"
        >
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Average Quality Score</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{averageQuality}%</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QualityTrends;`,
          language: 'typescript'
        }
      ];
    }
  }

  private getMockPullRequestSummary(pullRequestId: string): PullRequestSummary {
    return {
      id: `summary-${Date.now()}`,
      pullRequestId,
      summary: "This PR implements user authentication with GitHub and Google OAuth integration. It adds login and signup forms with proper validation, error handling, and toast notifications. The authentication flow is well-structured with appropriate state management and loading indicators. Security improvements include proper token handling and redirect management.",
      keyChanges: [
        "Added GitHub and Google OAuth authentication methods to AuthProvider",
        "Created LoginForm and SignupForm components with form validation",
        "Implemented proper error handling and loading states",
        "Updated password reset flow with correct redirect URLs",
        "Added toast notifications for user feedback"
      ],
      potentialIssues: [
        "Consider adding rate limiting for authentication attempts to prevent brute force attacks",
        "The demo mode simulation might not fully represent the actual OAuth flow",
        "Error messages could be more specific to help users troubleshoot issues"
      ],
      suggestedFeedback: [
        "Add unit tests for the authentication components",
        "Consider implementing remember me functionality for longer sessions",
        "Add more comprehensive form validation feedback"
      ],
      securityConsiderations: [
        "Ensure CSRF protection is implemented for authentication endpoints",
        "Store tokens securely and implement proper token refresh mechanisms",
        "Consider adding multi-factor authentication in the future"
      ],
      testingRecommendations: [
        "Test OAuth flows with actual GitHub and Google accounts",
        "Verify error handling for various failure scenarios",
        "Test the authentication persistence across page refreshes"
      ],
      generatedAt: new Date(),
      model: 'gpt-4o',
      confidence: 0.92
    };
  }
}

export const pullRequestService = new PullRequestService();
`,