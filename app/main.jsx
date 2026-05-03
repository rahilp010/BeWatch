import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { queryClient } from './lib/queryClient';
import 'rsuite/dist/rsuite-no-reset.css';

createRoot(document.getElementById('root')).render(
   <QueryClientProvider client={queryClient}>
      <App />
   </QueryClientProvider>,
);
