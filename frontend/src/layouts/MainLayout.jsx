import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useFrappeAuth } from 'frappe-react-sdk'
import { Button } from '../components/FrappeUI'
import { usePermissions } from '../hooks/usePermissions'
import FloatingActionButton from '../components/FloatingActionButton'

export default function MainLayout( { children } ) {
  const { currentUser } = useFrappeAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [ isMobileMenuOpen, setIsMobileMenuOpen ] = React.useState( false )
  const [ isAdminMenuOpen, setIsAdminMenuOpen ] = React.useState( false )
  const { isAdmin, canCreateCourse, canCreateBatch, isLoading: permissionsLoading, profile } = usePermissions()

  // Debug: Log permissions in development
  React.useEffect( () => {
    if ( process.env.NODE_ENV === 'development' && profile ) {
      console.log( 'MainLayout Permissions:', {
        isAdmin,
        canCreateCourse,
        canCreateBatch,
        permissionsLoading,
        hasProfile: !!profile,
      } )
    }
  }, [ isAdmin, canCreateCourse, canCreateBatch, permissionsLoading, profile ] )

  const handleLogout = async () => {
    try {
      const csrfToken = window.csrf_token && typeof window.csrf_token === 'string' && !window.csrf_token.includes( '{{' )
        ? window.csrf_token
        : null

      if ( csrfToken ) {
        await fetch( '/api/method/wg_lms.api.auth.custom_web_logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Frappe-CSRF-Token': csrfToken,
          },
        } ).then( response => response.json() ).then( data => {
          console.log( "Logout response:", data )
          sessionStorage.clear()
          localStorage.clear()
          if ( data.message.redirect ) {
            navigate( data.redirect )
          }
        } ).catch( error => {
          console.error( "Logout error:", error )

        } )
      }
    } catch ( error ) {
      console.error( 'Logout error:', error )
      window.location.href = '/lms/login'
    }
  }

  const isGuest = !currentUser || currentUser === 'Guest'

  const isActive = ( path ) => location.pathname.startsWith( path )

  const navLinks = [
    { to: '/courses', label: 'Courses' },
    { to: '/batches', label: 'Batches' },
    ...( !isGuest ? [ { to: '/dashboard', label: 'Dashboard' }, { to: '/assignments', label: 'Assignments' } ] : [] )
  ]

  // Show admin menu if user has any creation permissions
  // Don't wait for loading to complete - show based on current state
  const showAdminMenu = !isGuest && !permissionsLoading && ( isAdmin || canCreateCourse || canCreateBatch )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header - Internal Tool Style */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo and nav links */}
            <div className="flex items-center flex-1">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  LMS
                </span>
              </Link>

              <div className="hidden md:flex md:ml-8 md:space-x-1">
                {navLinks.map( ( link ) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive( link.to )
                      ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    {link.label}
                  </Link>
                ) )}
              </div>
            </div>

            {/* User menu and ERP link */}
            <div className="flex items-center space-x-3">
              {/* CREATE COURSE BUTTON - Always visible if you have permission */}
              {!isGuest && !permissionsLoading && canCreateCourse && (
                <Button
                  as={Link}
                  to="/admin/courses/new"
                  variant="primary"
                  size="sm"
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                  className="hidden sm:flex"
                >
                  Create Course
                </Button>
              )}

              {/* Link back to ERP/Desk */}
              {!isGuest && (
                <a
                  href="/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="Back to ERP/Desk"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  ERP
                </a>
              )}

              {/* Admin Dashboard Link */}
              {showAdminMenu && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="Admin Dashboard"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Admin
                </Link>
              )}

              {/* Admin Menu */}
              {showAdminMenu && (
                <div className="relative">
                  <Button
                    onClick={() => setIsAdminMenuOpen( !isAdminMenuOpen )}
                    variant="outline"
                    size="sm"
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    }
                  >
                    More
                  </Button>

                  {isAdminMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsAdminMenuOpen( false )}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                            onClick={() => setIsAdminMenuOpen( false )}
                          >
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              Admin Dashboard
                            </div>
                          </Link>
                        )}
                        {canCreateCourse && (
                          <Link
                            to="/admin/courses/new"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsAdminMenuOpen( false )}
                          >
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              Create Course
                            </div>
                          </Link>
                        )}
                        {canCreateBatch && (
                          <Link
                            to="/admin/batches/new"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsAdminMenuOpen( false )}
                          >
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Create Batch
                            </div>
                          </Link>
                        )}
                        {isAdmin && (
                          <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                            <Link
                              to="/admin/assignments"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setIsAdminMenuOpen( false )}
                            >
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Assignment Dashboard
                              </div>
                            </Link>
                            <Link
                              to="/admin/assignments/new"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setIsAdminMenuOpen( false )}
                            >
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Assign Training
                              </div>
                            </Link>
                            <Link
                              to="/admin/settings"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setIsAdminMenuOpen( false )}
                            >
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                              </div>
                            </Link>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {isGuest ? (
                <Button as={Link} to="/login" variant="primary" size="sm">
                  Sign In
                </Button>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {currentUser?.charAt( 0 )?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:block max-w-[120px] truncate">{currentUser}</span>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                  >
                    Logout
                  </Button>
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen( !isMobileMenuOpen )}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navLinks.map( ( link ) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${isActive( link.to )
                    ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  onClick={() => setIsMobileMenuOpen( false )}
                >
                  {link.label}
                </Link>
              ) )}
              {!isGuest && (
                <>
                  {showAdminMenu && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Admin
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-3 py-2 text-base font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border-b border-gray-200 dark:border-gray-700 mb-1"
                          onClick={() => setIsMobileMenuOpen( false )}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      {canCreateCourse && (
                        <Link
                          to="/admin/courses/new"
                          className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                          onClick={() => setIsMobileMenuOpen( false )}
                        >
                          Create Course
                        </Link>
                      )}
                      {canCreateBatch && (
                        <Link
                          to="/admin/batches/new"
                          className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                          onClick={() => setIsMobileMenuOpen( false )}
                        >
                          Create Batch
                        </Link>
                      )}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin/assignments"
                            className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            onClick={() => setIsMobileMenuOpen( false )}
                          >
                            Assignment Dashboard
                          </Link>
                          <Link
                            to="/admin/assignments/new"
                            className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            onClick={() => setIsMobileMenuOpen( false )}
                          >
                            Assign Training
                          </Link>
                          <Link
                            to="/admin/settings"
                            className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            onClick={() => setIsMobileMenuOpen( false )}
                          >
                            Settings
                          </Link>
                        </>
                      )}
                    </>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => setIsMobileMenuOpen( false )}
                  >
                    Profile
                  </Link>
                  <a
                    href="/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => setIsMobileMenuOpen( false )}
                  >
                    Back to ERP
                  </a>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen( false ); }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Floating Action Button for Quick Create */}
      <FloatingActionButton />

      {/* Footer - Minimal for internal tool */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Waseela LMS - Internal Learning Platform
          </p>
        </div>
      </footer>
    </div>
  )
}
