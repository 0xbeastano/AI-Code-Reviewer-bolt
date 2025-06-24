// Deployment utilities for Netlify

export interface DeploymentStatus {
  state: 'pending' | 'building' | 'ready' | 'error';
  deploy_url?: string;
  claim_url?: string;
  claimed?: boolean;
}

export async function getDeploymentStatus({ id }: { id: string }): Promise<DeploymentStatus> {
  try {
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get deployment status: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      state: data.state,
      deploy_url: data.url,
      claim_url: data.account_slug ? null : data.admin_url,
      claimed: !!data.account_slug
    };
  } catch (error) {
    console.error('Error getting deployment status:', error);
    throw error;
  }
}