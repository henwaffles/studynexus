import './style.css'
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import Layout from './components/Layout'
const Home = lazy(() => import('./pages/Home'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const Library = lazy(() => import('./pages/Library'))
const Explore = lazy(() => import('./pages/Explore'))
const Study = lazy(() => import('./pages/Study'))
const Stats = lazy(() => import('./pages/Stats'))
const Decks = lazy(() => import('./pages/Decks'))
const DeckDetail = lazy(() => import('./pages/DeckDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
import ProtectedRoute from './components/ProtectedRoute'
import api from './utils/api'

// Service worker registration (production only)
// Using VitePWA helper improves update behavior (reduces stale cached chunks).
if ((import.meta as any)?.env?.PROD) {
  registerSW({ immediate: true });
}

// Test API connection
async function testApiConnection() {
  try {
    const response = await api.get('/health');
    console.log('✅ API Connection Successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
    throw error;
  }
}

// Run API test only in dev
const isDev = (import.meta as any)?.env?.DEV === true;
if (isDev) {
  testApiConnection()
    .then((data) => {
      console.log('Backend Status:', data);
    })
    .catch(() => {
      console.error('Failed to connect to backend');
    });
}

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Register />
                </Suspense>
              }
            />
            <Route path="/" element={<Layout />}>
              <Route
                index
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Home />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="flashcards"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Flashcards />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="library"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Library />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="explore"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Explore />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="study"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Study />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="stats"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Stats />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="decks"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Decks />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="decks/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <DeckDetail />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="u/:username"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Profile />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Settings />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
