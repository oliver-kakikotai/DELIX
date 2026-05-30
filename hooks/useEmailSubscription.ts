import { useState } from 'react';

interface SubscriptionState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string;
  successMessage: string;
}

interface UseEmailSubscriptionReturn {
  subscriptionState: SubscriptionState;
  subscribe: (email: string) => Promise<void>;
  reset: () => void;
}

export function useEmailSubscription(): UseEmailSubscriptionReturn {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    errorMessage: '',
    successMessage: ''
  });

  const subscribe = async (email: string): Promise<void> => {
    // 重置状态
    setSubscriptionState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      errorMessage: '',
      successMessage: ''
    });

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 处理不同的错误状态
        let errorMessage = 'Subscription failed. Please try again.';
        
        if (response.status === 400) {
          errorMessage = 'Please enter a valid email address.';
        } else if (response.status === 409) {
          errorMessage = 'This email is already subscribed.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        setSubscriptionState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          errorMessage,
          successMessage: ''
        });
        return;
      }

      // 订阅成功
      setSubscriptionState({
        isLoading: false,
        isSuccess: true,
        isError: false,
        errorMessage: '',
        successMessage: data.message || 'Successfully subscribed!'
      });

      // 3秒后自动重置成功状态
      setTimeout(() => {
        setSubscriptionState(prev => ({
          ...prev,
          isSuccess: false,
          successMessage: ''
        }));
      }, 3000);

    } catch (error) {
      console.error('Subscription error:', error);
      setSubscriptionState({
        isLoading: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'Network error. Please check your connection.',
        successMessage: ''
      });
    }
  };

  const reset = (): void => {
    setSubscriptionState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      errorMessage: '',
      successMessage: ''
    });
  };

  return {
    subscriptionState,
    subscribe,
    reset
  };
}