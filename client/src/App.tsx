import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage, AccountPage } from '@/pages';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </BrowserRouter>
  );
}