'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    fetch('/api/auth/check-member-auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/member/dashboard')
        }
      })
      .catch(() => {
        // Not authenticated, stay on login page
      })

    // Check for error in URL params
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'access_denied':
          setError('Sie haben den Zugriff auf Ihr Battle.net-Konto abgelehnt.')
          break
        case 'invalid_state':
          setError('Ungültiger Authentifizierungsstatus. Bitte versuchen Sie es erneut.')
          break
        case 'missing_parameters':
          setError('Fehlende Parameter. Bitte versuchen Sie es erneut.')
          break
        case 'authentication_failed':
          setError('Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
          break
        case 'database_error':
          setError('Datenbankfehler. Bitte kontaktieren Sie einen Administrator.')
          break
        default:
          setError('Ein unbekannter Fehler ist aufgetreten.')
      }
    }
  }, [router, searchParams])

  const handleBattleNetLogin = () => {
    setIsLoading(true)
    setError(null)
    window.location.href = '/api/auth/battlenet'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-24 w-24 relative">
            <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <svg 
                className="w-16 h-16 text-white" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Mitglieder-Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Melde dich mit deinem Battle.net-Account an, um auf dein Mitglieder-Dashboard zuzugreifen
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <button
              onClick={handleBattleNetLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg 
                  className="h-8 w-8" 
                  viewBox="0 0 40 40" 
                  fill="currentColor"
                >
                  <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 36.364c-9.03 0-16.364-7.334-16.364-16.364S10.97 3.636 20 3.636 36.364 10.97 36.364 20 29.03 36.364 20 36.364z"/>
                  <path d="M20 7.273c-7.02 0-12.727 5.707-12.727 12.727S12.98 32.727 20 32.727 32.727 27.02 32.727 20 27.02 7.273 20 7.273zm0 21.818c-5.01 0-9.091-4.081-9.091-9.091S14.99 10.909 20 10.909 29.091 14.99 29.091 20 25.01 29.091 20 29.091z"/>
                </svg>
              </span>
              {isLoading ? 'Weiterleitung...' : 'Mit Battle.net anmelden'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Noch kein Mitglied?{' '}
              <a 
                href="/#application" 
                className="font-medium text-red-500 hover:text-red-400 transition-colors"
              >
                Jetzt bewerben
              </a>
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-white mb-2">
              Was passiert nach der Anmeldung?
            </h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Automatische Synchronisation deiner WoW-Charaktere</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Wöchentliche Aktivitäts-Tracking (M+, Raids, Vault)</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Einsicht in Gilden-Statistiken und Ranglisten</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Zugriff auf exklusive Mitglieder-Inhalte</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <a 
              href="/" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Zurück zur Startseite
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MemberLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Lädt...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

