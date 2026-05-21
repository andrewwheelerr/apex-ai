import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import Leads from './pages/Leads';
import Settings from './pages/Settings';
import AgentConfig from './pages/AgentConfig';
import Integrations from './pages/Integrations';
import ConversationDetail from './pages/ConversationDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/dashboard"                element={<Dashboard />}            />
          <Route path="/conversations"            element={<Conversations />}        />
          <Route path="/conversations/:id"        element={<ConversationDetail />}   />
          <Route path="/leads"                    element={<Leads />}                />
          <Route path="/settings"                 element={<Settings />}             />
          <Route path="/agent-config"             element={<AgentConfig />}          />
          <Route path="/integrations"             element={<Integrations />}         />
          <Route path="/"                         element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
