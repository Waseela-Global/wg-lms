import React from 'react'

export default function QuizQuestion( { question, questionNumber, userAnswer, onAnswerChange, showResults = false } ) {
  const handleAnswerChange = ( value ) => {
    if ( showResults ) return
    onAnswerChange( question.name, value )
  }

  const isCorrect = ( optionName ) => {
    if ( !showResults || !userAnswer ) return false
    return optionName === userAnswer && question.options.find( opt => opt.name === optionName )?.is_correct
  }

  const isWrong = ( optionName ) => {
    if ( !showResults || !userAnswer ) return false
    return optionName === userAnswer && !question.options.find( opt => opt.name === optionName )?.is_correct
  }

  const isCorrectAnswer = ( optionName ) => {
    if ( !showResults ) return false
    return question.options.find( opt => opt.name === optionName )?.is_correct
  }

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Question {questionNumber}
          {question.marks && (
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
            </span>
          )}
        </h3>
      </div>

      <div
        className="prose dark:prose-invert max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />

      {question.type === 'Single Choice' && (
        <div className="space-y-3">
          {question.options?.map( ( option ) => (
            <label
              key={option.name}
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${showResults
                  ? isCorrect( option.name )
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isWrong( option.name )
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isCorrectAnswer( option.name )
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-gray-700'
                  : userAnswer === option.name
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
            >
              <input
                type="radio"
                name={`question-${question.name}`}
                value={option.name}
                checked={userAnswer === option.name}
                onChange={() => handleAnswerChange( option.name )}
                disabled={showResults}
                className="mt-1 mr-3"
              />
              <span className="flex-1 text-gray-900 dark:text-gray-100">{option.option}</span>
              {showResults && isCorrectAnswer( option.name ) && (
                <svg className="w-5 h-5 text-green-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </label>
          ) )}
        </div>
      )}

      {question.type === 'Multiple Choice' && (
        <div className="space-y-3">
          {question.options?.map( ( option ) => {
            const isSelected = userAnswer && ( Array.isArray( userAnswer ) ? userAnswer.includes( option.name ) : userAnswer === option.name )
            return (
              <label
                key={option.name}
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${showResults
                    ? isCorrectAnswer( option.name )
                      ? isSelected
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-green-300 bg-green-50 dark:bg-green-900/10'
                      : isSelected
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    : isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
              >
                <input
                  type="checkbox"
                  name={`question-${question.name}`}
                  value={option.name}
                  checked={isSelected}
                  onChange={( e ) => {
                    const currentAnswers = Array.isArray( userAnswer ) ? userAnswer : ( userAnswer ? [ userAnswer ] : [] )
                    if ( e.target.checked ) {
                      handleAnswerChange( [ ...currentAnswers, option.name ] )
                    } else {
                      handleAnswerChange( currentAnswers.filter( a => a !== option.name ) )
                    }
                  }}
                  disabled={showResults}
                  className="mt-1 mr-3"
                />
                <span className="flex-1 text-gray-900 dark:text-gray-100">{option.option}</span>
                {showResults && isCorrectAnswer( option.name ) && (
                  <svg className="w-5 h-5 text-green-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
            )
          } )}
        </div>
      )}

      {question.type === 'True/False' && (
        <div className="space-y-3">
          {question.options?.map( ( option ) => (
            <label
              key={option.name}
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${showResults
                  ? isCorrect( option.name )
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isWrong( option.name )
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isCorrectAnswer( option.name )
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-gray-700'
                  : userAnswer === option.name
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
            >
              <input
                type="radio"
                name={`question-${question.name}`}
                value={option.name}
                checked={userAnswer === option.name}
                onChange={() => handleAnswerChange( option.name )}
                disabled={showResults}
                className="mt-1 mr-3"
              />
              <span className="flex-1 text-gray-900 dark:text-gray-100">{option.option}</span>
              {showResults && isCorrectAnswer( option.name ) && (
                <svg className="w-5 h-5 text-green-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </label>
          ) )}
        </div>
      )}

      {showResults && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Explanation:</p>
          <div
            className="prose dark:prose-invert prose-sm max-w-none text-blue-800 dark:text-blue-200"
            dangerouslySetInnerHTML={{ __html: question.explanation }}
          />
        </div>
      )}
    </div>
  )
}
