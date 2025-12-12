import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDiscussions } from '../hooks/useDiscussions'
import DiscussionCard from '../components/DiscussionCard'
import CreateDiscussion from '../components/CreateDiscussion'

export default function Discussions() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { discussions, isLoading, refetch } = useDiscussions( courseId, lessonId )

  if ( isLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate( -1 )}
          className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Discussions
        </h1>
        {courseId && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Course discussions
          </p>
        )}
        {lessonId && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Lesson discussions
          </p>
        )}
      </div>

      <CreateDiscussion
        courseId={courseId}
        lessonId={lessonId}
        onCreated={refetch}
      />

      {discussions.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No discussions yet. Be the first to start one!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map( ( discussion ) => (
            <DiscussionCard key={discussion.name} discussion={discussion} />
          ) )}
        </div>
      )}
    </div>
  )
}
