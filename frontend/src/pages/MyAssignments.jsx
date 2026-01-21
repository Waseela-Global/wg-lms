import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyAssignments } from "../hooks/useTrainingAssignment";
import AssignmentCard from "../components/AssignmentCard";
import OverdueBadge from "../components/OverdueBadge";

export default function MyAssignments() {
	const navigate = useNavigate();
	const [ statusFilter, setStatusFilter ] = useState( null );
	const { assignments, isLoading } = useMyAssignments( statusFilter );

	const overdueCount = assignments?.filter( ( a ) => a.is_overdue ).length || 0;
	const completedCount = assignments?.filter( ( a ) => a.status === "Completed" ).length || 0;
	const inProgressCount = assignments?.filter( ( a ) => a.status === "In Progress" ).length || 0;
	const assignedCount = assignments?.filter( ( a ) => a.status === "Assigned" ).length || 0;

	if ( isLoading ) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Assignments</h1>
				<p className="text-gray-600 dark:text-gray-400">
					View and complete your assigned trainings
				</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
				<div className="card p-4">
					<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</div>
					<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
						{assignments.length}
					</div>
				</div>
				<div className="card p-4">
					<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overdue</div>
					<div className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueCount}</div>
				</div>
				<div className="card p-4">
					<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</div>
					<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
						{inProgressCount}
					</div>
				</div>
				<div className="card p-4">
					<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</div>
					<div className="text-2xl font-bold text-success-600 dark:text-success-400">
						{completedCount}
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mb-6 flex gap-2 flex-wrap">
				<button
					onClick={() => setStatusFilter( null )}
					className={`px-4 py-2 rounded-lg text-sm font-medium ${!statusFilter
							? "bg-primary-600 text-white"
							: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
						}`}
				>
					All
				</button>
				<button
					onClick={() => setStatusFilter( "Assigned" )}
					className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "Assigned"
							? "bg-primary-600 text-white"
							: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
						}`}
				>
					Assigned
				</button>
				<button
					onClick={() => setStatusFilter( "In Progress" )}
					className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "In Progress"
							? "bg-primary-600 text-white"
							: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
						}`}
				>
					In Progress
				</button>
				<button
					onClick={() => setStatusFilter( "Overdue" )}
					className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "Overdue"
							? "bg-primary-600 text-white"
							: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
						}`}
				>
					Overdue
				</button>
				<button
					onClick={() => setStatusFilter( "Completed" )}
					className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === "Completed"
							? "bg-primary-600 text-white"
							: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
						}`}
				>
					Completed
				</button>
			</div>

			{/* Assignments List */}
			{assignments.length === 0 ? (
				<div className="card p-12 text-center">
					<p className="text-gray-500 dark:text-gray-400">
						{statusFilter ? `No ${statusFilter.toLowerCase()} assignments` : "No assignments yet"}
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{assignments.map( ( assignment ) => (
						<AssignmentCard key={assignment.name} assignment={assignment} />
					) )}
				</div>
			)}
		</div>
	);
}
