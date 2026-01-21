import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignTraining, useBulkAssignTraining, useAssignmentFormData } from "../../hooks/useTrainingAssignment";
import dayjs from "dayjs";

export default function TrainingAssignment() {
	const navigate = useNavigate();
	const { assignTraining, loading: assigning, error: assignError } = useAssignTraining();
	const { bulkAssignTraining, loading: bulkAssigning } = useBulkAssignTraining();

	const { courses, roles, departments, users, loading: metaLoading, error: metaError } = useAssignmentFormData();
	const [ selectedCourse, setSelectedCourse ] = useState( "" );
	const [ assignmentType, setAssignmentType ] = useState( "Mandatory" );
	const [ dueDate, setDueDate ] = useState( dayjs().add( 30, "days" ).format( "YYYY-MM-DD" ) );
	const [ autoRenewalPeriod, setAutoRenewalPeriod ] = useState( 0 );

	// Assignment method
	const [ assignmentMethod, setAssignmentMethod ] = useState( "role" ); // role, department, individual, bulk

	// Filters
	const [ selectedRoles, setSelectedRoles ] = useState( [] );
	const [ selectedDepartments, setSelectedDepartments ] = useState( [] );
	const [ selectedUsers, setSelectedUsers ] = useState( [] );
	const [ bulkUserList, setBulkUserList ] = useState( "" );

	if ( metaLoading ) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
			</div>
		);
	}

	if ( metaError ) {
		return (
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
					<h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">Failed to load data</h2>
					<p className="text-red-700 dark:text-red-300">Unable to load courses, roles, departments, or users.</p>
				</div>
			</div>
		);
	}

	const handleSubmit = async ( e ) => {
		e.preventDefault();
		console.log( "🔥 ~ handleSubmit ~ selectedCourse: ", assignmentMethod )
		if ( !selectedCourse ) {
			alert( "Please select a course" );
			return;
		}

		let result;

		if ( assignmentMethod === "bulk" ) {
			// Bulk assignment
			const userList = bulkUserList
				.split( "\n" )
				.map( ( u ) => u.trim() )
				.filter( ( u ) => u );
			if ( userList.length === 0 ) {
				alert( "Please enter at least one user email" );
				return;
			}
			result = await bulkAssignTraining( selectedCourse, userList, dueDate, assignmentType, autoRenewalPeriod );
		} else {
			// Filter-based assignment
			const filters = {};
			if ( assignmentMethod === "role" && selectedRoles.length > 0 ) {
				filters.roles = selectedRoles;
			} else if ( assignmentMethod === "department" && selectedDepartments.length > 0 ) {
				filters.departments = selectedDepartments;
			} else if ( assignmentMethod === "individual" && selectedUsers.length > 0 ) {
				filters.users = selectedUsers;
			} else {
				alert( "Please select at least one filter option" );
				return;
			}

			result = await assignTraining(
				selectedCourse,
				assignmentType,
				filters,
				dueDate,
				autoRenewalPeriod
			);
		}

		if ( result.success ) {
			alert( `Successfully assigned training to ${result.assignments_created} user(s)` );
			navigate( "/admin/assignments" );
		} else {
			alert( result.error || "Failed to assign training" );
		}
	};

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
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Assign Training</h1>
			</div>

			<form onSubmit={handleSubmit} className="card p-8 space-y-6">
				{/* Course Selection */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Course <span className="text-red-500">*</span>
					</label>
					<select
						value={selectedCourse}
						onChange={( e ) => setSelectedCourse( e.target.value )}
						className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
						required
					>
						<option value="">Select a course</option>
						{courses.map( ( course ) => (
							<option key={course.name} value={course.name}>
								{course.title}
							</option>
						) )}
					</select>
				</div>

				{/* Assignment Method */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Assignment Method <span className="text-red-500">*</span>
					</label>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						{[ "role", "department", "individual", "bulk" ].map( ( method ) => (
							<button
								key={method}
								type="button"
								onClick={() => setAssignmentMethod( method )}
								className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${assignmentMethod === method
									? "bg-primary-600 text-white"
									: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
									}`}
							>
								{method}
							</button>
						) )}
					</div>
				</div>

				{/* Role Selection */}
				{assignmentMethod === "role" && (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Select Roles
						</label>
						<div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
							{roles.map( ( role ) => (
								<label key={role.name} className="flex items-center mb-2">
									<input
										type="checkbox"
										checked={selectedRoles.includes( role.name )}
										onChange={( e ) => {
											if ( e.target.checked ) {
												setSelectedRoles( [ ...selectedRoles, role.name ] );
											} else {
												setSelectedRoles( selectedRoles.filter( ( r ) => r !== role.name ) );
											}
										}}
										className="mr-2"
									/>
									<span className="text-gray-900 dark:text-gray-100">{role.name}</span>
								</label>
							) )}
						</div>
					</div>
				)}

				{/* Department Selection */}
				{assignmentMethod === "department" && (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Select Departments
						</label>
						<div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
							{departments.map( ( dept ) => (
								<label key={dept.name} className="flex items-center mb-2">
									<input
										type="checkbox"
										checked={selectedDepartments.includes( dept.name )}
										onChange={( e ) => {
											if ( e.target.checked ) {
												setSelectedDepartments( [ ...selectedDepartments, dept.name ] );
											} else {
												setSelectedDepartments(
													selectedDepartments.filter( ( d ) => d !== dept.name )
												);
											}
										}}
										className="mr-2"
									/>
									<span className="text-gray-900 dark:text-gray-100">{dept.name}</span>
								</label>
							) )}
						</div>
					</div>
				)}

				{/* Individual User Selection */}
				{assignmentMethod === "individual" && (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Select Users
						</label>
						<div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
							{users.map( ( user ) => (
								<label key={user.name} className="flex items-center mb-2">
									<input
										type="checkbox"
										checked={selectedUsers.includes( user.name )}
										onChange={( e ) => {
											if ( e.target.checked ) {
												setSelectedUsers( [ ...selectedUsers, user.name ] );
											} else {
												setSelectedUsers( selectedUsers.filter( ( u ) => u !== user.name ) );
											}
										}}
										className="mr-2"
									/>
									<span className="text-gray-900 dark:text-gray-100">
										{user.full_name || user.name}
									</span>
								</label>
							) )}
						</div>
					</div>
				)}

				{/* Bulk User List */}
				{assignmentMethod === "bulk" && (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							User Emails (one per line)
						</label>
						<textarea
							value={bulkUserList}
							onChange={( e ) => setBulkUserList( e.target.value )}
							rows={6}
							className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
							placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
						/>
					</div>
				)}

				{/* Assignment Type */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Assignment Type
					</label>
					<select
						value={assignmentType}
						onChange={( e ) => setAssignmentType( e.target.value )}
						className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
					>
						<option value="Mandatory">Mandatory</option>
						<option value="Optional">Optional</option>
					</select>
				</div>

				{/* Due Date */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Due Date <span className="text-red-500">*</span>
					</label>
					<input
						type="date"
						value={dueDate}
						onChange={( e ) => setDueDate( e.target.value )}
						className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
						required
					/>
				</div>

				{/* Auto Renewal */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Auto Renewal Period (months)
					</label>
					<input
						type="number"
						value={autoRenewalPeriod}
						onChange={( e ) => setAutoRenewalPeriod( parseInt( e.target.value ) || 0 )}
						min="0"
						className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
					/>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						0 = No auto renewal
					</p>
				</div>

				{/* Submit */}
				<div className="flex justify-end gap-4">
					<button
						type="button"
						onClick={() => navigate( -1 )}
						className="btn btn-secondary"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={assigning || bulkAssigning}
						className="btn btn-primary"
					>
						{assigning || bulkAssigning ? "Assigning..." : "Assign Training"}
					</button>
				</div>
			</form>
		</div>
	);
}
