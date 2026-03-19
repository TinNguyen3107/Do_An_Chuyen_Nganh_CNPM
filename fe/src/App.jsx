import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/index';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;