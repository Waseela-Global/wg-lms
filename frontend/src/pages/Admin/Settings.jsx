import React from 'react'

export default function Settings() {
  const [settings, setSettings] = React.useState({
    allow_guest_access: false,
    disable_signup: false,
    contact_email: '',
    meta_description: '',
  })
  const [isLoading, setIsLoading] = React.useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // TODO: Implement settings update API call
      console.log('Saving settings:', settings)
      alert('Settings saved successfully')
    } catch (error) {
      alert('Error saving settings: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        LMS Settings
      </h1>
      
      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Access Control
          </h2>
          
          <div className="flex items-center">
            <input
              id="allow_guest_access"
              type="checkbox"
              checked={settings.allow_guest_access}
              onChange={(e) => setSettings({ ...settings, allow_guest_access: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="allow_guest_access" className="ml-2 label">
              Allow Guest Access
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="disable_signup"
              type="checkbox"
              checked={settings.disable_signup}
              onChange={(e) => setSettings({ ...settings, disable_signup: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="disable_signup" className="ml-2 label">
              Disable Public Signup
            </label>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Contact Information
          </h2>
          
          <div>
            <label htmlFor="contact_email" className="label block mb-2">
              Contact Email
            </label>
            <input
              id="contact_email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            SEO
          </h2>
          
          <div>
            <label htmlFor="meta_description" className="label block mb-2">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              value={settings.meta_description}
              onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
              className="input w-full"
              rows="3"
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

