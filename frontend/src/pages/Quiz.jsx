import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuiz, useStartQuiz, useSubmitQuiz, useQuizAttempt } from '../hooks/useQuiz'
import QuizQuestion from '../components/QuizQuestion'
import QuizResults from '../components/QuizResults'

export default function Quiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { quiz, isLoading: quizLoading } = useQuiz( quizId )
  const { startQuiz, loading: startingQuiz } = useStartQuiz()
  const { submitQuiz, loading: submittingQuiz } = useSubmitQuiz()

  const [ attemptId, setAttemptId ] = useState( null )
  const [ answers, setAnswers ] = useState( {} )
  const [ currentQuestion, setCurrentQuestion ] = useState( 0 )
  const [ timeRemaining, setTimeRemaining ] = useState( null )
  const [ showResults, setShowResults ] = useState( false )
  const [ result, setResult ] = useState( null )

  const { attempt: attemptDetails, isLoading: loadingAttempt } = useQuizAttempt( attemptId )

  useEffect( () => {
    if ( quizId && !attemptId ) {
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
    const result = await startQuiz( quizId )
    if ( result.success ) {
      setAttemptId( result.attemptId )
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
    const result = await submitQuiz( attemptId, answers )
    if ( result.success ) {
      setResult( result )
      setShowResults( true )
    }
  }

  const formatTime = ( seconds ) => {
    const mins = Math.floor( seconds / 60 )
    const secs = seconds % 60
    return `${mins.toString().padStart( 2, '0' )}:${secs.toString().padStart( 2, '0' )}`
  }

  if ( quizLoading || startingQuiz || loadingAttempt ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    )
  }

  if ( !quiz ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500 dark:text-gray-400">Quiz not found</p>
      </div>
    )
  }

  if ( !quiz.can_attempt ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Maximum Attempts Reached
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have reached the maximum number of attempts for this quiz.
          </p>
          {quiz.course && (
            <button
              onClick={() => navigate( `/courses/${quiz.course}` )}
              className="btn btn-primary"
            >
              Back to Course
            </button>
          )}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {quiz.title}
          </h1>
          {timeRemaining !== null && (
            <div className={`text-lg font-semibold px-4 py-2 rounded ${timeRemaining < 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
              ⏱ {formatTime( timeRemaining )}
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
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {quiz.questions.map( ( _, index ) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion( index )}
              className={`w-8 h-8 rounded ${index === currentQuestion
                  ? 'bg-primary-600 text-white'
                  : answers[ quiz.questions[ index ].name ]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              {index + 1}
            </button>
          ) )}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submittingQuiz || answeredQuestions === 0}
            className="btn btn-primary"
          >
            {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn btn-primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
