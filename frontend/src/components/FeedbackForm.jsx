import React, { useState } from "react";

export default function FeedbackForm( { form, onSubmit, loading } ) {
	const [ responses, setResponses ] = useState( form?.responses || {} );

	if ( !form || !form.questions ) {
		return <div className="text-gray-500 dark:text-gray-400">Loading feedback form...</div>;
	}

	const handleResponseChange = ( questionName, value ) => {
		setResponses( ( prev ) => ( {
			...prev,
			[ questionName ]: value,
		} ) );
	};

	const handleSubmit = ( e ) => {
		e.preventDefault();

		// Validate required questions
		const requiredQuestions = form.questions.filter( ( q ) => q.required );
		const missingRequired = requiredQuestions.filter(
			( q ) => !responses[ q.name ] || responses[ q.name ] === ""
		);

		if ( missingRequired.length > 0 ) {
			alert( `Please answer all required questions: ${missingRequired.map( ( q ) => q.question ).join( ", " )}` );
			return;
		}

		onSubmit( responses );
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{form.questions.map( ( question ) => (
				<div key={question.name} className="card p-6">
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						{question.question}
						{question.required && <span className="text-red-500 ml-1">*</span>}
					</label>

					{question.type === "Rating" && (
						<div className="flex gap-2">
							{[ 1, 2, 3, 4, 5 ].map( ( rating ) => (
								<button
									key={rating}
									type="button"
									onClick={() => handleResponseChange( question.name, rating )}
									className={`w-12 h-12 rounded-lg border-2 transition-colors ${responses[ question.name ] === rating
											? "bg-primary-500 border-primary-500 text-white"
											: "border-gray-300 dark:border-gray-600 hover:border-primary-300"
										}`}
								>
									{rating}
								</button>
							) )}
						</div>
					)}

					{question.type === "Likert" && question.options && (
						<div className="space-y-2">
							{question.options.map( ( option, index ) => (
								<label
									key={index}
									className="flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors hover:border-primary-300"
								>
									<input
										type="radio"
										name={question.name}
										value={option}
										checked={responses[ question.name ] === option}
										onChange={( e ) => handleResponseChange( question.name, e.target.value )}
										className="mr-3"
									/>
									<span className="text-gray-900 dark:text-gray-100">{option}</span>
								</label>
							) )}
						</div>
					)}

					{question.type === "Text" && (
						<textarea
							value={responses[ question.name ] || ""}
							onChange={( e ) => handleResponseChange( question.name, e.target.value )}
							rows={4}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
							placeholder="Enter your response..."
							required={question.required}
						/>
					)}

					{question.type === "Yes-No" && (
						<div className="flex gap-4">
							<label className="flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors hover:border-primary-300">
								<input
									type="radio"
									name={question.name}
									value="Yes"
									checked={responses[ question.name ] === "Yes"}
									onChange={( e ) => handleResponseChange( question.name, e.target.value )}
									className="mr-2"
								/>
								<span className="text-gray-900 dark:text-gray-100">Yes</span>
							</label>
							<label className="flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors hover:border-primary-300">
								<input
									type="radio"
									name={question.name}
									value="No"
									checked={responses[ question.name ] === "No"}
									onChange={( e ) => handleResponseChange( question.name, e.target.value )}
									className="mr-2"
								/>
								<span className="text-gray-900 dark:text-gray-100">No</span>
							</label>
						</div>
					)}
				</div>
			) )}

			<div className="flex justify-end">
				<button type="submit" disabled={loading} className="btn btn-primary">
					{loading ? "Submitting..." : "Submit Feedback"}
				</button>
			</div>
		</form>
	);
}
