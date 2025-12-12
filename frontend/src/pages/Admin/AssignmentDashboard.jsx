import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignmentStats } from "../../hooks/useTrainingAssignment";
import { callAPI } from "../../utils/api";

export default function AssignmentDashboard() {
	const navigate = useNavigate();
	const [ courseFilter, setCourseFilter ] = useState( null );
	const [ statusFilter, setStatusFilter ] = useState( null );
	const { stats, isLoading } = useAssignmentStats( {
		course: courseFilter,
		status: statusFilter,
	} );
	const [ courses, setCourses ] = useState( [] );

	useEffect( () => {
		const fetchCourses = async () => {
			try {
				const data = await callAPI( "wg_lms.api.courses.get_courses", {} );
				setCourses( data || [] );
			} catch ( err ) {
				console.error( "Failed to load courses:", err );
			}
		};
		fetchCourses();
	}, [] );

	if ( isLoading ) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
						Assignment Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						View completion statistics and manage assignments
					</p>
				</div>
				<button
					onClick={() => navigate( "/admin/assignments/new" )}
					className="btn btn-primary"
				>
					Assign Training
				</button>
			</div>

			{/* Filters */}
			<div className="card p-6 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Filter by Course
						</label>
						<select
							value={courseFilter || ""}
							onChange={( e ) => setCourseFilter( e.target.value || null )}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
						>
							<option value="">All Courses</option>
							{courses?.map( ( course ) => (
								<option key={course.name} value={course.name}>
									{course.title}
								</option>
							) )}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Filter by Status
						</label>
						<select
							value={statusFilter || ""}
							onChange={( e ) => setStatusFilter( e.target.value || null )}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
						>
							<option value="">All Status</option>
							<option value="Assigned">Assigned</option>
							<option value="In Progress">In Progress</option>
							<option value="Completed">Completed</option>
							<option value="Overdue">Overdue</option>
						</select>
					</div>
				</div>
			</div>

			{/* Overall Stats */}
			{stats?.overall && (
				<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
					<div className="card p-4 text-center">
						<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
							{stats.overall.total}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
					</div>
					<div className="card p-4 text-center">
						<div className="text-2xl font-bold text-green-600 dark:text-green-400">
							{stats.overall.completed}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
					</div>
					<div className="card p-4 text-center">
						<div className="text-2xl font-bold text-red-600 dark:text-red-400">
							{stats.overall.overdue}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
					</div>
					<div className="card p-4 text-center">
						<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
							{stats.overall.in_progress}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
					</div>
					<div className="card p-4 text-center">
						<div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
							{stats.overall.completion_rate}%
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
					</div>
				</div>
			)}

			{/* Stats by Role */}
			{stats?.by_role && Object.keys( stats.by_role ).length > 0 && (
				<div className="card p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
						Completion by Role
					</h2>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200 dark:border-gray-700">
									<th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Role
									</th>
									<th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Total
									</th>
									<th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Completed
									</th>
									<th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Overdue
									</th>
									<th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Rate
									</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries( stats.by_role ).map( ( [ role, data ] ) => (
									<tr
										key={role}
										className="border-b border-gray-100 dark:border-gray-800"
									>
										<td className="py-3 px-4 text-gray-900 dark:text-gray-100">{role}</td>
										<td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
											{data.total}
										</td>
										<td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
											{data.completed}
										</td>
										<td className="py-3 px-4 text-right text-red-600 dark:text-red-400">
											{data.overdue}
										</td>
										<td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
											{data.total > 0
												? Math.round( ( data.completed / data.total ) * 100 )
												: 0}
											%
										</td>
									</tr>
								) )}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Stats by Department */}
			{stats?.by_department && Object.keys( stats.by_department ).length > 0 && (
				<div className="card p-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
						Completion by Department
					</h2>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200 dark:border-gray-700">
									<th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Department
									</th>
									<th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Total
									</th>
									<th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Completed
									</th>
									<th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Overdue
									</th>
									<th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
										Rate
									</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries( stats.by_department ).map( ( [ dept, data ] ) => (
									<tr
										key={dept}
										className="border-b border-gray-100 dark:border-gray-800"
									>
										<td className="py-3 px-4 text-gray-900 dark:text-gray-100">{dept}</td>
										<td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
											{data.total}
										</td>
										<td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
											{data.completed}
										</td>
										<td className="py-3 px-4 text-right text-red-600 dark:text-red-400">
											{data.overdue}
										</td>
										<td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
											{data.total > 0
												? Math.round( ( data.completed / data.total ) * 100 )
												: 0}
											%
										</td>
									</tr>
								) )}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
