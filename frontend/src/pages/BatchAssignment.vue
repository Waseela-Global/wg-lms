<template>
	<div class="">
		<header
			class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5"
		>
			<Breadcrumbs class="h-7" :items="breadcrumbs" />
		</header>
		
		<div class="p-5">
			<div class="mb-6">
				<h1 class="text-2xl font-semibold mb-2">Batch Assignment</h1>
				<p class="text-gray-600">Select multiple users and assign them to batches efficiently</p>
				
				<!-- Selection Mode Toggle -->
				<div class="mt-4 p-4 bg-gray-50 border rounded-lg">
					<label class="block text-sm font-medium text-gray-700 mb-3">Selection Mode</label>
					<div class="flex space-x-4">
						<label class="flex items-center cursor-pointer">
							<input
								v-model="selectionMode"
								type="radio"
								value="individual"
								class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
							/>
							<span class="ml-2 text-sm text-gray-700">Individual Users</span>
						</label>
						<label class="flex items-center cursor-pointer">
							<input
								v-model="selectionMode"
								type="radio"
								value="role_profile"
								class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
							/>
							<span class="ml-2 text-sm text-gray-700">By User Role</span>
						</label>
					</div>
				</div>
			</div>
			
			<div class="max-w-6xl mx-auto">
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<!-- User Selection Panel -->
					<div class="lg:col-span-2">
						<div class="bg-white border rounded-lg p-6 shadow-sm">
							<!-- Individual User Selection -->
							<div v-if="selectionMode === 'individual'" class="mb-4">
								<label class="block text-sm font-medium text-gray-700 mb-2">
									Select Users
									<span class="text-xs text-gray-500 ml-1">({{ selectedUsers.length }} selected)</span>
								</label>
								
								<!-- Search Input -->
								<div class="relative mb-3">
									<input
										v-model="userSearch"
										type="text"
										placeholder="Search users by name or email..."
										class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
									<div class="absolute inset-y-0 right-0 pr-3 flex items-center">
										<svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
										</svg>
									</div>
								</div>
								
								<!-- User List -->
								<div class="border border-gray-300 rounded-md bg-white max-h-64 overflow-y-auto">
									<div class="p-2">
										<div class="flex items-center justify-between mb-2 pb-2 border-b">
											<span class="text-xs font-medium text-gray-600">
												{{ filteredUsers.length }} users available
											</span>
											<div class="flex space-x-2">
												<button
													@click="selectAllUsers"
													class="text-xs text-blue-600 hover:text-blue-800 font-medium"
												>
													Select All
												</button>
												<button
													@click="clearAllUsers"
													class="text-xs text-red-600 hover:text-red-800 font-medium"
												>
													Clear All
												</button>
											</div>
										</div>
										
										<div class="space-y-1">
											<div
												v-for="user in filteredUsers"
												:key="user.name"
												@click="toggleUser(user.name)"
												class="flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors"
											>
												<input
													type="checkbox"
													:checked="selectedUsers.includes(user.name)"
													class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
													@click.stop="toggleUser(user.name)"
												/>
												<div class="flex items-center space-x-3 flex-1">
													<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
														<span class="text-blue-600 font-semibold text-xs">
															{{ (user.full_name || user.name).charAt(0).toUpperCase() }}
														</span>
													</div>
													<div class="flex-1 min-w-0">
														<div class="text-sm font-medium text-gray-900 truncate">
															{{ user.full_name || user.name }}
														</div>
														<div class="text-xs text-gray-500 truncate">
															{{ user.email }}
														</div>
														<div v-if="user.role_profile_name" class="text-xs text-blue-600 truncate">
															Role: {{ user.role_profile_name }}
														</div>
													</div>
												</div>
											</div>
										</div>
										
										<div v-if="filteredUsers.length === 0" class="text-center py-4">
											<div class="text-gray-400 text-sm">No users found</div>
										</div>
									</div>
								</div>
							</div>
							
							<!-- Role Profile Selection -->
							<div v-else-if="selectionMode === 'role_profile'" class="mb-4">
								<label class="block text-sm font-medium text-gray-700 mb-2">
									Select Role Profile
									<span class="text-xs text-gray-500 ml-1">({{ getUsersByRoleProfile().length }} users will be selected)</span>
								</label>
								
								<Select
									v-model="selectedRoleProfile"
									:options="roleProfileOptions"
									placeholder="Choose a role profile..."
									class="w-full mb-3"
								/>
								
								<!-- Preview users for selected role profile -->
								<div v-if="selectedRoleProfile" class="border border-gray-300 rounded-md bg-white max-h-48 overflow-y-auto">
									<div class="p-2">
										<div class="text-xs font-medium text-gray-600 mb-2 pb-2 border-b">
											{{ getUsersByRoleProfile().length }} users with role profile "{{ selectedRoleProfile }}"
										</div>
										
										<div class="space-y-1">
											<div
												v-for="user in getUsersByRoleProfile()"
												:key="user.name"
												class="flex items-center p-2 bg-blue-50 rounded"
											>
												<div class="flex items-center space-x-3 flex-1">
													<div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
														<span class="text-blue-600 font-semibold text-xs">
															{{ (user.full_name || user.name).charAt(0).toUpperCase() }}
														</span>
													</div>
													<div class="flex-1 min-w-0">
														<div class="text-sm font-medium text-gray-900 truncate">
															{{ user.full_name || user.name }}
														</div>
														<div class="text-xs text-gray-500 truncate">
															{{ user.email }}
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							
							<!-- Selected Users Display -->
							<div v-if="selectedUsers.length" class="mt-4">
								<div class="flex items-center justify-between mb-3">
									<h3 class="text-sm font-medium text-gray-700">
										Selected Users ({{ selectedUsers.length }})
									</h3>
									<button 
										@click="clearAllUsers"
										class="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-full transition-colors font-medium"
									>
										Clear All
									</button>
								</div>
								<div class="max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
									<div class="flex flex-wrap gap-2">
										<div 
											v-for="userId in selectedUsers" 
											:key="userId"
											class="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
										>
											<span class="mr-2">{{ getUserDisplayName(userId) }}</span>
											<button 
												@click="removeUser(userId)"
												class="inline-flex items-center justify-center w-4 h-4 bg-blue-200 hover:bg-blue-300 text-blue-600 rounded-full transition-colors font-bold text-xs"
												title="Remove user"
											>
												×
											</button>
										</div>
									</div>
								</div>
							</div>
							
							<div v-else class="mt-4 p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
								<div class="text-gray-400 text-3xl mb-2">👥</div>
								<p class="text-sm text-gray-600 font-medium">No users selected</p>
								<p class="text-xs text-gray-500 mt-1">Search and click users above to select them</p>
							</div>
						</div>
					</div>
					
					<!-- Batch Selection & Actions Panel -->
					<div class="lg:col-span-1">
						<div class="bg-white border rounded-lg p-6 shadow-sm space-y-6">
							<!-- Batch Selection -->
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">
									Select Batch
								</label>
								<Select
									v-model="selectedBatch"
									:options="batchOptions"
									placeholder="Choose a batch..."
									class="w-full"
								/>
							</div>
							
							<!-- Assignment Preview -->
							<div v-if="effectiveSelectedUsers.length && selectedBatch" class="p-4 rounded-lg border" :class="capacityValidation.isValid ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'">
								<h3 class="font-medium mb-3" :class="capacityValidation.isValid ? 'text-blue-900' : 'text-red-900'">
									Assignment Preview
								</h3>
								<div class="space-y-2 text-sm">
									<div class="flex justify-between">
										<span class="text-gray-600">Users:</span>
										<span class="font-semibold" :class="capacityValidation.isValid ? 'text-blue-700' : 'text-red-700'">
											{{ effectiveSelectedUsers.length }}
										</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-600">Batch:</span>
										<span class="font-medium truncate ml-2" :class="capacityValidation.isValid ? 'text-blue-700' : 'text-red-700'" :title="getSelectedBatchName()">
											{{ getSelectedBatchName() }}
										</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-600">Available Seats:</span>
										<span class="font-medium" :class="capacityValidation.isValid ? 'text-blue-700' : 'text-red-700'">
											{{ capacityValidation.availableSeats }}
										</span>
									</div>
									<div class="flex justify-between border-t pt-2" :class="capacityValidation.isValid ? 'border-blue-200' : 'border-red-200'">
										<span class="font-medium" :class="capacityValidation.isValid ? 'text-blue-800' : 'text-red-800'">
											Total Enrollments:
										</span>
										<span class="font-bold" :class="capacityValidation.isValid ? 'text-blue-900' : 'text-red-900'">
											{{ effectiveSelectedUsers.length }}
										</span>
									</div>
									
									<!-- Course Enrollment Info -->
									<div v-if="selectedBatchCourses.length > 0" class="border-t pt-2" :class="capacityValidation.isValid ? 'border-blue-200' : 'border-red-200'">
										<div class="flex justify-between mb-1">
											<span class="font-medium text-xs" :class="capacityValidation.isValid ? 'text-blue-800' : 'text-red-800'">
												Auto-enrollment in courses:
											</span>
										</div>
										<div class="text-xs" :class="capacityValidation.isValid ? 'text-blue-600' : 'text-red-600'">
											{{ selectedBatchCourses.map(c => c.title).join(', ') }}
										</div>
									</div>
									
									<!-- Capacity Warning -->
									<div v-if="!capacityValidation.isValid" class="mt-3 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
										<div class="font-medium">⚠️ Capacity Exceeded</div>
										<div>{{ capacityValidation.message }}</div>
									</div>
								</div>
							</div>
							
							<!-- Email Notification Option -->
							<div v-if="effectiveSelectedUsers.length && selectedBatch && capacityValidation.isValid" class="p-3 bg-gray-50 rounded-lg border">
								<label class="flex items-center space-x-2 cursor-pointer">
									<input
										v-model="sendEmailNotification"
										type="checkbox"
										class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<span class="text-sm text-gray-700">
										Send email notification to students
									</span>
								</label>
								<div class="text-xs text-gray-500 mt-1">
									Students will receive a confirmation email with batch details
								</div>
							</div>
							
							<!-- Assignment Button -->
							<div>
								<Button
									variant="solid"
									:loading="assignmentResource.loading"
									:disabled="!effectiveSelectedUsers.length || !selectedBatch || !capacityValidation.isValid"
									@click="assignBatch"
									class="w-full py-3"
								>
									<template v-if="!effectiveSelectedUsers.length || !selectedBatch">
										{{ selectionMode === 'role_profile' ? 'Select Role Profile & Batch' : 'Select Users & Batch' }}
									</template>
									<template v-else-if="!capacityValidation.isValid">
										Capacity Exceeded - Cannot Assign
									</template>
									<template v-else>
										{{ sendEmailNotification ? '📧 ' : '' }}Assign Batch to {{ effectiveSelectedUsers.length }} Student{{ effectiveSelectedUsers.length !== 1 ? 's' : '' }}
									</template>
								</Button>
							</div>
							
							<!-- Quick Stats -->
							<div class="border-t pt-4">
								<h4 class="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
								<div class="space-y-3">
									<div class="flex justify-between items-center p-2 bg-gray-50 rounded">
										<span class="text-xs text-gray-600">Total Users</span>
										<span class="font-semibold text-gray-800">{{ users.data?.length || 0 }}</span>
									</div>

									<div class="flex justify-between items-center p-2 bg-blue-50 rounded">
										<span class="text-xs text-blue-600">Selected Users</span>
										<span class="font-bold text-blue-800">{{ effectiveSelectedUsers.length }}</span>
									</div>
									
									<div v-if="selectionMode === 'role_profile'" class="flex justify-between items-center p-2 bg-green-50 rounded">
										<span class="text-xs text-green-600">Selection Mode</span>
										<span class="font-bold text-green-800">Role Profile</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Recent Assignments -->
				<div v-if="recentAssignments.data?.length" class="mt-8">
					<h3 class="text-lg font-medium mb-4">Recent Batch Assignments</h3>
					<div class="bg-white border rounded-lg overflow-hidden">
						<!-- Desktop Table View -->
						<div class="hidden md:block">
							<table class="w-full">
								<thead class="bg-gray-50">
									<tr>
										<th class="text-left p-3 font-medium text-gray-700">User</th>
										<th class="text-left p-3 font-medium text-gray-700">Batch</th>
										<th class="text-left p-3 font-medium text-gray-700">Assigned On</th>
										<th class="text-left p-3 font-medium text-gray-700">Status</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="assignment in recentAssignments.data"
										:key="`${assignment.member}-${assignment.batch}`"
										class="border-t hover:bg-gray-50"
									>
										<td class="p-3 font-medium">{{ assignment.member_name || assignment.member }}</td>
										<td class="p-3">{{ assignment.batch_title || assignment.batch }}</td>
										<td class="p-3 text-sm text-gray-600">{{ formatDate(assignment.creation) }}</td>
										<td class="p-3">
											<span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
												Enrolled
											</span>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						
						<!-- Mobile Card View -->
						<div class="md:hidden">
							<div 
								v-for="assignment in recentAssignments.data"
								:key="`${assignment.member}-${assignment.batch}`"
								class="p-4 border-b last:border-b-0"
							>
								<div class="flex justify-between items-start mb-2">
									<div class="font-medium text-gray-900">
										{{ assignment.member_name || assignment.member }}
									</div>
									<span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
										Enrolled
									</span>
								</div>
								<div class="text-sm text-gray-600 mb-1">
									{{ assignment.batch_title || assignment.batch }}
								</div>
								<div class="text-xs text-gray-500">
									{{ formatDate(assignment.creation) }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { 
	Breadcrumbs, 
	Button,
	Select,
	createListResource, 
	createResource,
	usePageMeta 
} from 'frappe-ui'
import { computed, inject, ref, watch } from 'vue'
import { sessionStore } from '../stores/session'

const { brand } = sessionStore()
const dayjs = inject('$dayjs')

const breadcrumbs = computed(() => {
	return [
		{
			label: 'Batch Assignment',
			route: {
				name: 'BatchAssignment',
			},
		},
	]
})

// Selected values
const selectedUsers = ref([])
const selectedBatch = ref('')
const userSearch = ref('')
const sendEmailNotification = ref(true)
const selectedBatchCourses = ref([])
const selectionMode = ref('individual')
const selectedRoleProfile = ref('')

// Resources
const users = createResource({
	url: 'lms.lms.api.get_users_for_batch_assignment',
	auto: true,
})

const batches = createResource({
	url: 'lms.lms.api.get_batches_for_assignment',
	auto: true,
})

const roleProfiles = createResource({
	url: 'lms.lms.api.get_role_profiles',
	auto: true,
})

const assignmentResource = createResource({
	url: 'lms.lms.api.assign_batches_to_users',
	onSuccess(data) {
		const emailSent = sendEmailNotification.value
		selectedUsers.value = []
		selectedRoleProfile.value = ''
		selectedBatch.value = ''
		sendEmailNotification.value = true // Reset to default
		recentAssignments.reload()
		batches.reload() // Refresh batch data to update seat counts
		
		if (data.created > 0) {
			const emailText = emailSent ? ' Confirmation emails have been sent to students.' : ''
			let courseText = ''
			
			// Show course enrollment info if available
			if (data.created_enrollments && data.created_enrollments.length > 0) {
				const firstEnrollment = data.created_enrollments[0]
				if (firstEnrollment.courses_enrolled && firstEnrollment.courses_enrolled.length > 0) {
					const courseCount = firstEnrollment.courses_enrolled.length
					courseText = ` Students have been automatically enrolled in ${courseCount} course${courseCount > 1 ? 's' : ''}.`
				}
			}
			
			frappe.show_alert({
				message: `Successfully assigned batch to ${data.created} student(s)!${emailText}${courseText}`,
				indicator: 'green',
			})
		} else {
			frappe.show_alert({
				message: 'All selected users are already enrolled in this batch',
				indicator: 'orange',
			})
		}
	},
	onError(error) {
		frappe.show_alert({
			message: error.message || 'Failed to assign batch',
			indicator: 'red',
		})
	},
})

const recentAssignments = createListResource({
	doctype: 'LMS Batch Enrollment',
	fields: [
		'member',
		'member_name', 
		'batch',
		'batch_title',
		'creation',
	],
	order_by: 'creation desc',
	page_length: 50, // Show more recent assignments
	auto: true,
})

// Computed options for dropdowns
const filteredUsers = computed(() => {
	if (!users.data) return []
	if (!userSearch.value) return users.data
	
	const search = userSearch.value.toLowerCase()
	return users.data.filter(user => 
		(user.full_name || user.name).toLowerCase().includes(search) ||
		user.email.toLowerCase().includes(search)
	)
})

const batchOptions = computed(() => {
	if (!batches.data) return []
	return batches.data.map(batch => ({
		label: batch.title,
		value: batch.name,
		description: `Available: ${batch.available_seats}${batch.seat_count ? `/${batch.seat_count}` : ''} seats`,
	}))
})

const roleProfileOptions = computed(() => {
	if (!roleProfiles.data) return []
	return roleProfiles.data.map(profile => ({
		label: profile,
		value: profile,
	}))
})

// Get users by selected role profile
function getUsersByRoleProfile() {
	if (!selectedRoleProfile.value || !users.data) return []
	return users.data.filter(user => user.role_profile_name === selectedRoleProfile.value)
}

// Get effective selected users based on selection mode
const effectiveSelectedUsers = computed(() => {
	if (selectionMode.value === 'individual') {
		return selectedUsers.value
	} else if (selectionMode.value === 'role_profile' && selectedRoleProfile.value) {
		return getUsersByRoleProfile().map(user => user.name)
	}
	return []
})

const capacityValidation = computed(() => {
	if (!selectedBatch.value || !batches.data) {
		return { isValid: true, availableSeats: 'N/A', message: '' }
	}
	
	const batch = batches.data.find(b => b.name === selectedBatch.value)
	if (!batch) {
		return { isValid: true, availableSeats: 'N/A', message: '' }
	}
	
	// If batch has no seat limit (unlimited)
	if (!batch.seat_count || batch.seat_count <= 0) {
		return { 
			isValid: true, 
			availableSeats: 'Unlimited', 
			message: '' 
		}
	}
	
	// Calculate available seats using the API data
	const availableSeats = batch.available_seats
	const selectedCount = effectiveSelectedUsers.value.length
	
	// If unlimited seats, always valid
	if (availableSeats === "Unlimited") {
		return { isValid: true, availableSeats: 'Unlimited', message: '' }
	}
	
	const isValid = selectedCount <= availableSeats
	
	return {
		isValid,
		availableSeats: availableSeats.toString(),
		message: isValid 
			? '' 
			: `This batch only has ${availableSeats} available seats, but you've selected ${selectedCount} students.`
	}
})

// Helper methods
function getUserDisplayName(userId) {
	const user = users.data?.find(u => u.name === userId)
	return user ? (user.full_name || user.name) : userId
}

function getSelectedBatchName() {
	const batch = batches.data?.find(b => b.name === selectedBatch.value)
	return batch ? batch.title : selectedBatch.value
}

// Watch for batch selection changes to load courses
watch(selectedBatch, async (newBatch) => {
	if (newBatch) {
		try {
			const response = await frappe.call({
				method: 'frappe.client.get_list',
				args: {
					doctype: 'Batch Course',
					filters: { parent: newBatch },
					fields: ['course', 'title'],
					limit_page_length: 100
				}
			})
			selectedBatchCourses.value = response.message || []
		} catch (error) {
			console.error('Failed to load batch courses:', error)
			selectedBatchCourses.value = []
		}
	} else {
		selectedBatchCourses.value = []
	}
})

// Watch for selection mode changes to clear selections
watch(selectionMode, (newMode) => {
	if (newMode === 'individual') {
		selectedRoleProfile.value = ''
	} else if (newMode === 'role_profile') {
		selectedUsers.value = []
	}
})

function removeUser(userId) {
	const index = selectedUsers.value.indexOf(userId)
	if (index > -1) {
		selectedUsers.value.splice(index, 1)
	}
}

function toggleUser(userId) {
	const index = selectedUsers.value.indexOf(userId)
	if (index > -1) {
		selectedUsers.value.splice(index, 1)
	} else {
		selectedUsers.value.push(userId)
	}
}

function selectAllUsers() {
	const allUserIds = filteredUsers.value.map(user => user.name)
	// Add only users that aren't already selected
	allUserIds.forEach(userId => {
		if (!selectedUsers.value.includes(userId)) {
			selectedUsers.value.push(userId)
		}
	})
}

function clearAllUsers() {
	selectedUsers.value = []
}

function assignBatch() {
	if (!effectiveSelectedUsers.value.length || !selectedBatch.value) {
		const modeText = selectionMode.value === 'role_profile' ? 'role profile' : 'users'
		frappe.show_alert({
			message: `Please select at least one ${modeText} and a batch`,
			indicator: 'orange',
		})
		return
	}
	
	if (!capacityValidation.value.isValid) {
		frappe.show_alert({
			message: capacityValidation.value.message,
			indicator: 'red',
		})
		return
	}
	
	assignmentResource.submit({
		users: effectiveSelectedUsers.value,
		batches: [selectedBatch.value],
		send_email: sendEmailNotification.value,
	})
}

function formatDate(dateString) {
	return dayjs(dateString).format('DD MMM YYYY')
}

usePageMeta(() => {
	return {
		title: 'Batch Assignment',
		icon: brand.favicon,
	}
})
</script>