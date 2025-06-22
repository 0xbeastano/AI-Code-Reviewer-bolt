import { useCallback, useState } from 'react';

type AppStep = 'upload' | 'configure' | 'structure' | 'analyzing' | 'results' | 'improving' | 'validation' | 'report';

interface NavigationState {
  currentStep: AppStep;
  previousSteps: AppStep[];
  canGoBack: boolean;
}

export const useNavigation = (initialStep: AppStep = 'upload') => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentStep: initialStep,
    previousSteps: [],
    canGoBack: false
  });

  const navigateToStep = useCallback((step: AppStep) => {
    setNavigationState(prev => ({
      currentStep: step,
      previousSteps: [...prev.previousSteps, prev.currentStep],
      canGoBack: true
    }));
  }, []);

  const goBack = useCallback(() => {
    setNavigationState(prev => {
      if (prev.previousSteps.length === 0) return prev;
      
      const newPreviousSteps = [...prev.previousSteps];
      const previousStep = newPreviousSteps.pop()!;
      
      return {
        currentStep: previousStep,
        previousSteps: newPreviousSteps,
        canGoBack: newPreviousSteps.length > 0
      };
    });
  }, []);

  const resetNavigation = useCallback(() => {
    setNavigationState({
      currentStep: initialStep,
      previousSteps: [],
      canGoBack: false
    });
  }, [initialStep]);

  const getBreadcrumbItems = useCallback(() => {
    const stepLabels: Record<AppStep, string> = {
      upload: 'Upload',
      configure: 'Configure',
      structure: 'Structure',
      analyzing: 'Analyzing',
      results: 'Results',
      improving: 'Improving',
      validation: 'Validation',
      report: 'Report'
    };

    const items = navigationState.previousSteps.map(step => ({
      label: stepLabels[step],
      onClick: () => navigateToStep(step)
    }));

    items.push({
      label: stepLabels[navigationState.currentStep],
      current: true
    });

    return items;
  }, [navigationState, navigateToStep]);

  return {
    currentStep: navigationState.currentStep,
    canGoBack: navigationState.canGoBack,
    navigateToStep,
    goBack,
    resetNavigation,
    getBreadcrumbItems
  };
};