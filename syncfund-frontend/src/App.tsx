import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';
import { ToastProvider } from './components/ui/toast/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ToastProvider>
  );
}
