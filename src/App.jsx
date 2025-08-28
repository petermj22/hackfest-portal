import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';
import './styles/index.css';

function App() {
  useEffect(() => {
    // Make production check available globally
    if (import.meta.env.DEV) {
      import('./utils/productionCheck').then(({ productionCheck }) => {
        window.productionCheck = productionCheck;
        console.log('💡 Production check available: productionCheck.runProductionCheck()');
      });

      // Make webhook tester available globally
      import('./utils/webhookTester').then(({ webhookTester }) => {
        window.webhookTester = webhookTester;
        console.log('💡 Webhook tester available: webhookTester.testCompleteWebhookFlow(baseUrl)');
      });
    }
  }, []);

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;