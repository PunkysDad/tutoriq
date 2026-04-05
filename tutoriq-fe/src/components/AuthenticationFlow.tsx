import React, { useState } from 'react';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

type AuthView = 'login' | 'register';

export default function AuthenticationFlow() {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  if (currentView === 'register') {
    return <RegisterScreen onSwitchToLogin={() => setCurrentView('login')} />;
  }

  return <LoginScreen onSwitchToRegister={() => setCurrentView('register')} />;
}
