<template>
  <Dialog
    v-model="show"
    :options="{
      title: chapterDetail ? __('Edit Chapter') : __('Add Chapter'),
      size: 'lg',
      actions: [
        {
          label: chapterDetail ? __('Edit') : __('Create'),
          variant: 'solid',
          onClick: (close) =>
            chapterDetail ? editChapter(close) : addChapter(close),
        },
      ],
    }"
  >
    <template #body-content>
      <div class="space-y-4 text-base">
        <FormControl label="Title" v-model="chapter.title" :required="true" />
      </div>
    </template>
  </Dialog>
</template>
<script setup>
import { createResource, Dialog, FormControl, toast } from 'frappe-ui'
import { reactive, watch, inject } from 'vue'
import { capture } from '@/telemetry'
import { useOnboarding } from 'frappe-ui/frappe'

const show = defineModel()
const outline = defineModel('outline')
const user = inject('$user')
const { updateOnboardingStep } = useOnboarding('learning')

const props = defineProps({
  course: {
    type: String,
    required: true,
  },
  chapterDetail: {
    type: Object,
  },
})

const chapter = reactive({
  title: '',
})

const chapterResource = createResource({
  url: 'wg_lms.lms.api.upsert_chapter',
  makeParams(values) {
    return {
      title: chapter.title,
      course: props.course,
      name: props.chapterDetail?.name,
    }
  },
})

const chapterReference = createResource({
  url: 'frappe.client.insert',
  makeParams(values) {
    return {
      doc: {
        doctype: 'Chapter Reference',
        chapter: values.name,
        parent: props.course,
        parenttype: 'LMS Course',
        parentfield: 'chapters',
      },
    }
  },
})

const addChapter = async (close) => {
  chapterResource.submit(
    {},
    {
      validate() {
        return validateChapter()
      },
      onSuccess: (data) => {
        if (user.data?.is_system_manager)
          updateOnboardingStep('create_first_chapter')

        capture('chapter_created')
        chapterReference.submit(
          { name: data.name },
          {
            onSuccess(data) {
              cleanChapter()
              outline.value.reload()
              toast.success(__('Chapter added successfully'))
            },
            onError(err) {
              toast.error(err.messages?.[0] || err)
            },
          },
        )
        close()
      },
      onError(err) {
        toast.error(err.messages?.[0] || err)
      },
    },
  )
}

const validateChapter = () => {
  if (!chapter.title) {
    return __('Title is required')
  }
}

const cleanChapter = () => {
  chapter.title = ''
}

const editChapter = (close) => {
  chapterResource.submit(
    {},
    {
      validate() {
        if (!chapter.title) {
          return 'Title is required'
        }
      },
      onSuccess() {
        outline.value.reload()
        toast.success(__('Chapter updated successfully'))
        close()
      },
      onError(err) {
        toast.error(err.messages?.[0] || err)
      },
    },
  )
}

watch(
  () => props.chapterDetail,
  (newChapter) => {
    chapter.title = newChapter?.title
  },
)
</script>
