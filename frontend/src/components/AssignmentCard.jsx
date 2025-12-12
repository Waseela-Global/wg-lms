import React from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function AssignmentCard( { assignment } ) {
	const navigate = useNavigate();

	const isOverdue = assignment.is_overdue || ( assignment.due_date && dayjs( assignment.due_date ).isBefore( dayjs(), "day" ) );

	return (
		<div
			onClick={() => navigate( `/courses/${assignment.course}` )}
			className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow ${isOverdue ? "border-l-4 border-red-500" : ""
				}`}
		>
			<div className="flex items-start gap-4">
				{assignment.course_image ? (
					<img
						src={assignment.course_image}
						alt={assignment.course_title}
						className="w-20 h-20 rounded-lg object-cover"
					/>
				) : (
					<div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
						<svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 01.787 1.838l-7 3a1 1 0 01-1.394-1.84l7-3a1 1 0 00.394-1.84L3.25 6.051a1 1 0 01-.356-.257l-4-1.714a1 1 0 01.788-1.838l7 3z" />
						</svg>
					</div>
				)}

				<div className="flex-1">
					<div className="flex items-start justify-between mb-2">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							{assignment.course_title}
						</h3>
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${assignment.status === "Completed"
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
									: isOverdue
										? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
										: assignment.status === "In Progress"
											? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
											: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
								}`}
						>
							{assignment.status}
						</span>
					</div>

					<p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
						{assignment.short_introduction}
					</p>

					<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
						<div className="flex items-center gap-1">
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<span>Due: {dayjs( assignment.due_date ).format( "MMM D, YYYY" )}</span>
						</div>
						<div className="flex items-center gap-1">
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
								/>
							</svg>
							<span>{assignment.assignment_type}</span>
						</div>
					</div>
				</div>

				<svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
				</svg>
			</div>
		</div>
	);
}
