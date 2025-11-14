<template>
	<div>
		<div v-if="createdCourses.data?.length" class="mt-10">
			<div class="flex items-center justify-between mb-3">
				<span class="font-semibold text-lg text-ink-gray-9">
					{{ __('Courses Created') }}
				</span>
				<router-link
					:to="{
						name: 'Courses',
					}"
				>
					<span class="flex items-center space-x-1 text-ink-gray-5 text-xs">
						<span>
							{{ __('See all') }}
						</span>
						<MoveRight class="size-3 stroke-1.5" />
					</span>
				</router-link>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				<router-link
					v-for="course in createdCourses.data"
					:to="{ name: 'CourseDetail', params: { courseName: course.name } }"
				>
					<CourseCard :course="course" />
				</router-link>
			</div>
		</div>

		<div v-if="createdBatches.data?.length" class="mt-10">
			<div class="flex items-center justify-between mb-3">
				<span class="font-semibold text-lg">
					{{ __('Upcoming Batches') }}
				</span>
				<router-link
					:to="{
						name: 'Batches',
					}"
				>
					<span class="flex items-center space-x-1 text-ink-gray-5 text-xs">
						<span>
							{{ __('See all') }}
						</span>
						<MoveRight class="size-3 stroke-1.5" />
					</span>
				</router-link>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
				<router-link
					v-for="batch in createdBatches.data"
					:to="{ name: 'BatchDetail', params: { batchName: batch.name } }"
				>
					<BatchCard :batch="batch" />
				</router-link>
			</div>
		</div>

		<div
			v-if="!createdCourses.data?.length && !createdBatches.data?.length"
			class="flex flex-col items-center justify-center mt-60"
		>
			<GraduationCap class="size-10 mx-auto stroke-1 text-ink-gray-5" />
			<div class="text-lg font-semibold text-ink-gray-7 mb-1.5">
				{{ __('No courses created') }}
			</div>
			<div
				class="leading-5 text-base w-full md:w-2/5 text-base text-center text-ink-gray-7"
			>
				{{
					__(
						'There are no courses currently. Create your first course to get started!'
					)
				}}
			</div>
			<router-link
				:to="{ name: 'CourseForm', params: { courseName: 'new' } }"
				class="mt-4"
			>
				<Button>
					<template #prefix>
						<Plus class="size-4 stroke-1.5" />
					</template>
					{{ __('Create Course') }}
				</Button>
			</router-link>
		</div>

		<div class="grid grid-cols-2 gap-5 mt-10">
			<div v-if="evals?.data?.length">
				<div class="font-semibold text-lg mb-3">
					{{ __('Upcoming Evaluations') }}
				</div>
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
					<div
						v-for="evaluation in evals?.data"
						class="border rounded-md p-3 flex flex-col h-full cursor-pointer"
						@click="redirectToProfile()"
					>
						<div class="font-semibold text-ink-gray-9 text-lg mb-1">
							{{ evaluation.course_title }}
						</div>
						<div class="text-ink-gray-7 text-sm">
							<div class="flex items-center mb-2">
								<Calendar class="w-4 h-4 stroke-1.5" />
								<span class="ml-2">
									{{ dayjs(evaluation.date).format('DD MMMM YYYY') }}
								</span>
							</div>
							<div class="flex items-center mb-2">
								<Clock class="w-4 h-4 stroke-1.5" />
								<span class="ml-2">
									{{ formatTime(evaluation.start_time) }}
								</span>
							</div>
							<div class="flex items-center">
								<GraduationCap class="w-4 h-4 stroke-1.5" />
								<span class="ml-2">
									{{ evaluation.member_name }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { Button, createResource } from 'frappe-ui'
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import {
	Calendar,
	Clock,
	GraduationCap,
	MoveRight,
	Plus,
} from 'lucide-vue-next'
import { formatTime } from '@/utils'
import CourseCard from '@/components/CourseCard.vue'
import BatchCard from '@/components/BatchCard.vue'

const user = inject<any>('$user')
const dayjs = inject<any>('$dayjs')
const router = useRouter()

const props = defineProps<{
	evals?: { data?: any[] }
}>()

const createdCourses = createResource({
	url: 'wg_lms.lms.utils.get_created_courses',
	auto: true,
})

const createdBatches = createResource({
	url: 'wg_lms.lms.utils.get_created_batches',
	auto: true,
})

const redirectToProfile = () => {
	router.push({
		name: 'ProfileEvaluationSchedule',
		params: { username: user.data?.username },
	})
}
</script>
