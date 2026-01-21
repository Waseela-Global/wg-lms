import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuiz, useStartQuiz, useSubmitQuiz, useQuizAttempt } from '../hooks/useQuiz'
import QuizQuestion from '../components/QuizQuestion'
import QuizResults from '../components/QuizResults'

export default function Quiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { quiz, isLoading: quizLoading } = useQuiz( quizId )
  const { startQuiz, loading: startingQuiz, error: startError } = useStartQuiz()
  const { submitQuiz, loading: submittingQuiz, error: submitError } = useSubmitQuiz()

  const [ attemptId, setAttemptId ] = useState( null )
  const [ answers, setAnswers ] = useState( {} )
  const [ currentQuestion, setCurrentQuestion ] = useState( 0 )
  const [ timeRemaining, setTimeRemaining ] = useState( null )
  const [ showResults, setShowResults ] = useState( false )
  const [ result, setResult ] = useState( null )
  const [ error, setError ] = useState( null )

  const { attempt: attemptDetails, isLoading: loadingAttempt } = useQuizAttempt( attemptId )

  useEffect( () => {
    if ( quizId && !attemptId && !error ) {
      startQuizAttempt()
    }
  }, [ quizId ] )

  useEffect( () => {
    if ( quiz?.duration && attemptId && !showResults ) {
      setTimeRemaining( quiz.duration * 60 )
      const timer = setInterval( () => {
        setTimeRemaining( ( prev ) => {
          if ( prev <= 1 ) {
            clearInterval( timer )
            handleSubmit()
            return 0
          }
          return prev - 1
        } )
      }, 1000 )

      return () => clearInterval( timer )
    }
  }, [ quiz?.duration, attemptId, showResults ] )

  const startQuizAttempt = async () => {
    setError( null )
    const result = await startQuiz( quizId )
    if ( result.success ) {
      setAttemptId( result.attemptId )
      setError( null )
    } else {
      setError( result.error || 'Failed to start quiz' )
    }
  }

  const handleAnswerChange = ( questionName, answer ) => {
    setAnswers( ( prev ) => ( {
      ...prev,
      [ questionName ]: answer
    } ) )
  }

  const handleNext = () => {
    if ( currentQuestion < quiz.questions.length - 1 ) {
      setCurrentQuestion( currentQuestion + 1 )
    }
  }

  const handlePrevious = () => {
    if ( currentQuestion > 0 ) {
      setCurrentQuestion( currentQuestion - 1 )
    }
  }

  const handleSubmit = async () => {
    setError( null )
    const result = await submitQuiz( attemptId, answers )
    if ( result.success ) {
      setResult( result )
      setShowResults( true )
      setError( null )
    } else {
      setError( result.error || 'Failed to submit quiz' )
    }
  }

  const formatTime = ( seconds ) => {
    const mins = Math.floor( seconds / 60 )
    const secs = seconds % 60
    return `${mins.toString().padStart( 2, '0' )}:${secs.toString().padStart( 2, '0' )}`
  }

  // Check for maximum attempts error from hook
  const maxAttemptsError = error?.includes( 'Maximum attempts' ) ||
    error?.includes( 'maximum attempts' ) ||
    startError?.includes( 'Maximum attempts' ) ||
    startError?.includes( 'maximum attempts' )

  if ( quizLoading || ( startingQuiz && !error && !startError ) || loadingAttempt ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if ( !quiz ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Quiz not found</p>
        </div>
      </div>
    )
  }

  if ( !quiz.can_attempt || maxAttemptsError ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Maximum Attempts Reached
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || startError || 'You have reached the maximum number of attempts for this quiz.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {quiz.course && (
              <button
                onClick={() => navigate( `/courses/${quiz.course || ''}` )}
                className="btn btn-primary"
              >
                Back to Course
              </button>
            )}
            <button
              onClick={() => navigate( -1 )}
              className="btn btn-secondary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if ( showResults && attemptDetails ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <QuizResults
          attempt={attemptDetails.attempt}
          quiz={attemptDetails.quiz}
          onRetake={quiz.max_attempts === 0 || quiz.attempts_count < quiz.max_attempts ? startQuizAttempt : null}
        />

        {quiz.show_answers && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Review Answers
            </h3>
            {attemptDetails.questions?.map( ( question, index ) => (
              <QuizQuestion
                key={question.name}
                question={question}
                questionNumber={index + 1}
                userAnswer={question.user_answer}
                showResults={true}
              />
            ) )}
          </div>
        )}
      </div>
    )
  }

  const currentQ = quiz.questions[ currentQuestion ]
  const answeredQuestions = Object.keys( answers ).length
  const progress = ( answeredQuestions / quiz.questions.length ) * 100

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Error Message */}
      {( error || startError ) && !maxAttemptsError && (
        <div className="card p-4 mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">{error || startError}</p>
              {!attemptId && (
                <button
                  onClick={startQuizAttempt}
                  disabled={startingQuiz}
                  className="btn btn-sm btn-primary mt-2"
                >
                  {startingQuiz ? 'Retrying...' : 'Retry'}
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setError( null )
                if ( startError ) {
                  // Clear hook error by retrying
                  startQuizAttempt()
                }
              }}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {quiz.title}
          </h1>
          {timeRemaining !== null && (
            <div className={`text-lg font-semibold px-4 py-2 rounded-lg ${timeRemaining < 60
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
              : timeRemaining < 300
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
              <span className="inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime( timeRemaining )}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{answeredQuestions} answered</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      {currentQ && (
        <QuizQuestion
          question={currentQ}
          questionNumber={currentQuestion + 1}
          userAnswer={answers[ currentQ.name ]}
          onAnswerChange={handleAnswerChange}
        />
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn btn-secondary w-full sm:w-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="flex gap-2 flex-wrap justify-center">
          {quiz.questions.map( ( _, index ) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion( index )}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${index === currentQuestion
                ? 'bg-primary-600 text-white ring-2 ring-primary-300 dark:ring-primary-500'
                : answers[ quiz.questions[ index ].name ]
                  ? 'bg-success-500 text-white hover:bg-success-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              title={`Question ${index + 1}`}
            >
              {index + 1}
            </button>
          ) )}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submittingQuiz || answeredQuestions === 0}
            className="btn btn-primary w-full sm:w-auto"
          >
            {submittingQuiz ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Quiz
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn btn-primary w-full sm:w-auto"
          >
            Next
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
