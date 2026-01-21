import React from 'react'
import { useFrappeAuth, useFrappePostCall } from 'frappe-react-sdk'
import { useProfile } from '../hooks/useProfile'
import { usePermissions } from '../hooks/usePermissions'
import { Input, Textarea, Button, Card, Spinner, Alert } from '../components/FrappeUI'

export default function Profile() {
  const { currentUser } = useFrappeAuth()
  const { profile, isLoading, refetch } = useProfile()
  const { isAdmin, isInstructor, isStudent } = usePermissions()
  const { call: setValue, loading: saving } = useFrappePostCall( 'frappe.client.set_value' )
  const [ isEditing, setIsEditing ] = React.useState( false )
  const [ formData, setFormData ] = React.useState( {
    lms_bio: '',
    lms_linkedin_url: '',
    lms_github_url: '',
    lms_website: '',
    lms_phone: '',
  } )
  const [ saveError, setSaveError ] = React.useState( '' )
  const [ saveSuccess, setSaveSuccess ] = React.useState( false )

  React.useEffect( () => {
    if ( profile ) {
      setFormData( {
        lms_bio: profile.lms_bio || '',
        lms_linkedin_url: profile.lms_linkedin_url || '',
        lms_github_url: profile.lms_github_url || '',
        lms_website: profile.lms_website || '',
        lms_phone: profile.lms_phone || '',
      } )
    }
  }, [ profile ] )

  const handleSave = async () => {
    setSaveError( '' )
    setSaveSuccess( false )

    try {
      for ( const [ fieldname, value ] of Object.entries( formData ) ) {
        await setValue( {
          doctype: 'User',
          name: currentUser,
          fieldname,
          value,
        } )
      }

      setSaveSuccess( true )
      setIsEditing( false )
      refetch()
      setTimeout( () => setSaveSuccess( false ), 3000 )
    } catch ( err ) {
      setSaveError( err.message || 'Failed to save profile' )
    }
  }

  if ( isLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your profile information and preferences
        </p>
      </div>

      {saveError && (
        <Alert type="danger" className="mb-6">
          {saveError}
        </Alert>
      )}

      {saveSuccess && (
        <Alert type="success" className="mb-6">
          Profile updated successfully!
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Basic Information
              </h2>
              {!isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing( true )}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile?.full_name || currentUser}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="text-gray-900 dark:text-gray-100">
                  {profile?.email || currentUser}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Biography
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.lms_bio}
                    onChange={( e ) => setFormData( { ...formData, lms_bio: e.target.value } )}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="text-gray-600 dark:text-gray-400">
                    {profile?.lms_bio || 'No biography added yet'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={formData.lms_phone}
                    onChange={( e ) => setFormData( { ...formData, lms_phone: e.target.value } )}
                    placeholder="+1 234 567 8900"
                  />
                ) : (
                  <div className="text-gray-600 dark:text-gray-400">
                    {profile?.lms_phone || 'Not provided'}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={saving}
                  disabled={saving}
                >
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing( false )
                    if ( profile ) {
                      setFormData( {
                        lms_bio: profile.lms_bio || '',
                        lms_linkedin_url: profile.lms_linkedin_url || '',
                        lms_github_url: profile.lms_github_url || '',
                        lms_website: profile.lms_website || '',
                        lms_phone: profile.lms_phone || '',
                      } )
                    }
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </Card>

          {/* Social Links */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Social Links
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn Profile
                </label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={formData.lms_linkedin_url}
                    onChange={( e ) => setFormData( { ...formData, lms_linkedin_url: e.target.value } )}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <div>
                    {profile?.lms_linkedin_url ? (
                      <a
                        href={profile.lms_linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {profile.lms_linkedin_url}
                      </a>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub Profile
                </label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={formData.lms_github_url}
                    onChange={( e ) => setFormData( { ...formData, lms_github_url: e.target.value } )}
                    placeholder="https://github.com/yourusername"
                  />
                ) : (
                  <div>
                    {profile?.lms_github_url ? (
                      <a
                        href={profile.lms_github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {profile.lms_github_url}
                      </a>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Personal Website
                </label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={formData.lms_website}
                    onChange={( e ) => setFormData( { ...formData, lms_website: e.target.value } )}
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <div>
                    {profile?.lms_website ? (
                      <a
                        href={profile.lms_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {profile.lms_website}
                      </a>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Picture */}
          <Card className="p-6 text-center">
            {profile?.user_image ? (
              <img
                src={profile.user_image}
                alt={profile.full_name || currentUser}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold">
                {( profile?.full_name || currentUser )?.charAt( 0 )?.toUpperCase() || 'U'}
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {profile?.full_name || currentUser}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {profile?.email || currentUser}
            </p>

            {/* Roles */}
            <div className="space-y-2">
              {isAdmin && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                  Admin
                </span>
              )}
              {isInstructor && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  Instructor
                </span>
              )}
              {isStudent && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200">
                  Student
                </span>
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Account Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">LMS Access</span>
                <span className={`text-sm font-medium ${profile?.lms_enabled ? 'text-success-600 dark:text-success-400' : 'text-gray-400'}`}>
                  {profile?.lms_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


