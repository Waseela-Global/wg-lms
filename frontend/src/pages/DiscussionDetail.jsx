import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDiscussion, useAddReply } from '../hooks/useDiscussions'
import DiscussionReply from '../components/DiscussionReply'
import LessonContent from '../components/LessonContent'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useFrappeAuth } from 'frappe-react-sdk'

dayjs.extend( relativeTime )

export default function DiscussionDetail() {
  const { discussionId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useFrappeAuth()
  const { discussion, isLoading, refetch } = useDiscussion( discussionId )
  const { addReply, loading: replying } = useAddReply()
  const [ replyContent, setReplyContent ] = useState( '' )

  const handleSubmitReply = async ( e ) => {
    e.preventDefault()
    if ( !replyContent.trim() ) return

    const result = await addReply( discussionId, replyContent )
    if ( result.success ) {
      setReplyContent( '' )
      refetch()
    }
  }

  if ( isLoading ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if ( !discussion ) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500 dark:text-gray-400">Discussion not found</p>
      </div>
    )
  }

  const isOwner = discussion.owner === currentUser

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
          Back to Discussions
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {discussion.title}
        </h1>
      </div>

      {/* Main Discussion */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          {discussion.owner_image ? (
            <img
              src={discussion.owner_image}
              alt={discussion.owner_name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg font-medium">
              {discussion.owner_name?.charAt( 0 ) || 'U'}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {discussion.owner_name}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {dayjs( discussion.creation ).fromNow()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{discussion.view_count || 0} views</span>
                <span>{discussion.reply_count || 0} replies</span>
              </div>
            </div>
            <LessonContent content={discussion.content} />
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Replies ({discussion.replies?.length || 0})
        </h2>

        {discussion.replies && discussion.replies.length > 0 ? (
          <div className="space-y-4">
            {discussion.replies.map( ( reply ) => (
              <DiscussionReply
                key={reply.name}
                reply={reply}
                discussionOwner={discussion.owner}
                onReplyAdded={refetch}
              />
            ) )}
          </div>
        ) : (
          <div className="card p-6 text-center text-gray-500 dark:text-gray-400">
            No replies yet. Be the first to reply!
          </div>
        )}
      </div>

      {/* Reply Form */}
      {!discussion.is_locked && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Add a Reply
          </h3>
          <form onSubmit={handleSubmitReply}>
            <textarea
              value={replyContent}
              onChange={( e ) => setReplyContent( e.target.value )}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 mb-4"
              placeholder="Write your reply..."
              required
            />
            <button
              type="submit"
              disabled={replying || !replyContent.trim()}
              className="btn btn-primary"
            >
              {replying ? 'Posting...' : 'Post Reply'}
            </button>
          </form>
        </div>
      )}

      {discussion.is_locked && (
        <div className="card p-6 bg-yellow-50 dark:bg-yellow-900/20 text-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            This discussion is locked. No new replies can be added.
          </p>
        </div>
      )}
    </div>
  )
}
