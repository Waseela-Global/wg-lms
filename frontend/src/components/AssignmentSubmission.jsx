import React, { useState } from 'react'
import { useSubmitAssignment } from '../hooks/useAssignment'

export default function AssignmentSubmission( { assignment, onSubmitted } ) {
  const [ submission, setSubmission ] = useState( '' )
  const [ attachment, setAttachment ] = useState( null )
  const [ attachmentFile, setAttachmentFile ] = useState( null )
  const { submitAssignment, loading, error } = useSubmitAssignment()

  const handleFileChange = ( e ) => {
    const file = e.target.files[ 0 ]
    if ( file ) {
      setAttachmentFile( file )
      // In a real app, you'd upload the file first and get the file URL
      // For now, we'll just store the file reference
    }
  }

  const handleSubmit = async ( e ) => {
    e.preventDefault()

    if ( !submission.trim() && !attachmentFile ) {
      alert( 'Please provide a submission or attach a file' )
      return
    }

    const result = await submitAssignment( assignment.name, submission, attachment )
    if ( result.success ) {
      setSubmission( '' )
      setAttachmentFile( null )
      if ( onSubmitted ) {
        onSubmitted()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Submit Assignment
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Submission
        </label>
        <textarea
          value={submission}
          onChange={( e ) => setSubmission( e.target.value )}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          placeholder="Enter your submission here..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Attach File (Optional)
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
        />
        {attachmentFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {attachmentFile.name}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || ( !submission.trim() && !attachmentFile )}
        className="btn btn-primary"
      >
        {loading ? 'Submitting...' : 'Submit Assignment'}
      </button>
    </form>
  )
}
