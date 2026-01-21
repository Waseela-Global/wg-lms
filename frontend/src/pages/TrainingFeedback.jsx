import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFeedbackForm, useSubmitFeedback } from "../hooks/useFeedback";
import { useMyCourses } from "../hooks/useEnrollment";
import FeedbackForm from "../components/FeedbackForm";

export default function TrainingFeedback() {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const [ feedbackType, setFeedbackType ] = useState( "Post" );
	const { form, isLoading: formLoading } = useFeedbackForm( courseId, feedbackType );
	const { submitFeedback, loading: submitting } = useSubmitFeedback();
	const { myCourses } = useMyCourses();

	const enrollment = myCourses?.find( ( c ) => c.name === courseId || c.course === courseId );

	const handleSubmit = async ( responses ) => {
		if ( !enrollment ) {
			alert( "Enrollment not found" );
			return;
		}

		const result = await submitFeedback( enrollment.name, feedbackType, responses );
		if ( result.success ) {
			alert( "Feedback submitted successfully!" );
		navigate( `/courses/${courseId || ''}` );
		} else {
			alert( result.error || "Failed to submit feedback" );
		}
	};

	if ( formLoading ) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div className="mb-8">
				<button
					onClick={() => navigate( -1 )}
					className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
				>
					<svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back
				</button>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Training Feedback</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-2">
					Please provide your feedback on this training
				</p>
			</div>

			{/* Feedback Type Selector */}
			<div className="mb-6">
				<div className="flex gap-2">
					<button
						onClick={() => setFeedbackType( "Pre" )}
						className={`px-4 py-2 rounded-lg text-sm font-medium ${feedbackType === "Pre"
								? "bg-primary-600 text-white"
								: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
							}`}
					>
						Pre-Training Feedback
					</button>
					<button
						onClick={() => setFeedbackType( "Post" )}
						className={`px-4 py-2 rounded-lg text-sm font-medium ${feedbackType === "Post"
								? "bg-primary-600 text-white"
								: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
							}`}
					>
						Post-Training Feedback
					</button>
				</div>
			</div>

			{form && form.submitted ? (
				<div className="card p-8 text-center">
					<svg
						className="w-16 h-16 mx-auto text-success-600 mb-4"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
						Feedback Submitted
					</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						Thank you for your feedback!
					</p>
					<button onClick={() => navigate( `/courses/${courseId || ''}` )} className="btn btn-primary">
						Back to Course
					</button>
				</div>
			) : (
				<FeedbackForm form={form} onSubmit={handleSubmit} loading={submitting} />
			)}
		</div>
	);
}
