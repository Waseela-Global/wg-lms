import React, { useState } from 'react'
import { useCreateDiscussion } from '../hooks/useDiscussions'

export default function CreateDiscussion( { courseId, lessonId, onCreated } ) {
  const [ title, setTitle ] = useState( '' )
  const [ content, setContent ] = useState( '' )
  const [ showForm, setShowForm ] = useState( false )
  const { createDiscussion, loading, error } = useCreateDiscussion()

  const handleSubmit = async ( e ) => {
    e.preventDefault()
    if ( !title.trim() || !content.trim() ) return

    const result = await createDiscussion( courseId, lessonId, title, content )
    if ( result.success ) {
      setTitle( '' )
      setContent( '' )
      setShowForm( false )
      if ( onCreated ) onCreated()
    }
  }

  if ( !showForm ) {
    return (
      <button
        onClick={() => setShowForm( true )}
        className="btn btn-primary mb-6"
      >
        Start New Discussion
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Create New Discussion
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={( e ) => setTitle( e.target.value )}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          placeholder="Enter discussion title..."
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={( e ) => setContent( e.target.value )}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          placeholder="Enter your question or discussion topic..."
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="btn btn-primary"
        >
          {loading ? 'Creating...' : 'Create Discussion'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm( false )
            setTitle( '' )
            setContent( '' )
          }}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
