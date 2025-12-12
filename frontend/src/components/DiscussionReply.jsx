import React, { useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAddReply } from '../hooks/useDiscussions'
import { callAPI } from '../utils/api'

dayjs.extend( relativeTime )

export default function DiscussionReply( { reply, discussionOwner, onReplyAdded } ) {
  const [ showReplyForm, setShowReplyForm ] = useState( false )
  const [ replyContent, setReplyContent ] = useState( '' )
  const { addReply, loading } = useAddReply()

  const handleMarkAsSolution = async () => {
    try {
      await callAPI( 'wg_lms.api.discussions.mark_reply_as_solution', { reply_id: reply.name } )
      if ( onReplyAdded ) onReplyAdded()
    } catch ( err ) {
      alert( err.message || 'Failed to mark as solution' )
    }
  }

  const handleSubmitReply = async ( e ) => {
    e.preventDefault()
    if ( !replyContent.trim() ) return

    const result = await addReply( reply.discussion, replyContent )
    if ( result.success ) {
      setReplyContent( '' )
      setShowReplyForm( false )
      if ( onReplyAdded ) onReplyAdded()
    }
  }

  return (
    <div className={`p-4 rounded-lg mb-4 ${reply.is_solution
        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
        : 'bg-gray-50 dark:bg-gray-800'
      }`}>
      <div className="flex items-start gap-3">
        {reply.owner_image ? (
          <img
            src={reply.owner_image}
            alt={reply.owner_name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
            {reply.owner_name?.charAt( 0 ) || 'U'}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {reply.owner_name}
              </span>
              {reply.is_solution && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
                  Solution
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dayjs( reply.creation ).fromNow()}
            </span>
          </div>

          <div
            className="prose dark:prose-invert prose-sm max-w-none text-gray-700 dark:text-gray-300 mb-3"
            dangerouslySetInnerHTML={{ __html: reply.reply }}
          />

          <div className="flex items-center gap-4">
            {!reply.is_solution && discussionOwner && (
              <button
                onClick={handleMarkAsSolution}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Mark as Solution
              </button>
            )}
            <button
              onClick={() => setShowReplyForm( !showReplyForm )}
              className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400"
            >
              Reply
            </button>
          </div>

          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-4">
              <textarea
                value={replyContent}
                onChange={( e ) => setReplyContent( e.target.value )}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 mb-2"
                placeholder="Write a reply..."
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !replyContent.trim()}
                  className="btn btn-primary btn-sm"
                >
                  {loading ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm( false )
                    setReplyContent( '' )
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
