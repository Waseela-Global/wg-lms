import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFrappePostCall, useFrappeGetCall } from 'frappe-react-sdk'
import { useCategories } from '../../hooks/useCategories'
import { API_ENDPOINTS } from '../../utils/api'
import { Button, Input, Textarea, Select, Card, Alert, Spinner } from '../../components/FrappeUI'

export default function CourseForm() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!courseId

  const { categories, isLoading: categoriesLoading } = useCategories()
  const { call: createCourse, loading: createLoading, error: createError } = useFrappePostCall( API_ENDPOINTS.CREATE_COURSE )
  const { call: updateCourse, loading: updateLoading, error: updateError } = useFrappePostCall( API_ENDPOINTS.UPDATE_COURSE )

  // Log errors for debugging
  React.useEffect( () => {
    if ( createError ) {
      console.error( 'Create course error:', createError )
    }
    if ( updateError ) {
      console.error( 'Update course error:', updateError )
    }
  }, [ createError, updateError ] )

  // Load course data if editing
  const { data: courseData, isLoading: courseLoading } = useFrappeGetCall(
    API_ENDPOINTS.GET_COURSE_DETAIL,
    { course: courseId },
    courseId ? `course-${courseId}` : null,
    { revalidateOnFocus: false }
  )

  const [ formData, setFormData ] = React.useState( {
    title: '',
    short_introduction: '',
    description: '',
    category: '',
    published: false,
    featured: false,
    enable_certificate: false,
  } )

  const [ error, setError ] = React.useState( '' )
  const [ success, setSuccess ] = React.useState( false )

  // Load course data when editing
  React.useEffect( () => {
    if ( courseData && isEditMode ) {
      setFormData( {
        title: courseData.title || '',
        short_introduction: courseData.short_introduction || '',
        description: courseData.description || '',
        category: courseData.category || '',
        published: courseData.published || false,
        featured: courseData.featured || false,
        enable_certificate: courseData.enable_certificate || false,
      } )
    }
  }, [ courseData, isEditMode ] )

  const handleSubmit = async ( e ) => {
    e.preventDefault()
    setError( '' )
    setSuccess( false )

    try {
      const courseData = {
        ...formData,
        published: formData.published ? 1 : 0,
        featured: formData.featured ? 1 : 0,
        enable_certificate: formData.enable_certificate ? 1 : 0,
      }

      // Remove empty category
      if ( !courseData.category ) {
        delete courseData.category
      }

      if ( isEditMode ) {
        await updateCourse( { course: courseId, data: courseData } )
      } else {
        await createCourse( { data: courseData } )
      }

      setSuccess( true )
      setTimeout( () => {
        navigate( '/courses' )
      }, 1500 )
    } catch ( err ) {
      console.error( 'Course save error:', err )
      let errorMessage = 'Failed to save course. Please try again.'

      if ( err?.message ) {
        errorMessage = err.message
      } else if ( err?.exc ) {
        errorMessage = err.exc
      } else if ( typeof err === 'string' ) {
        errorMessage = err
      } else if ( err?.response?.message ) {
        errorMessage = err.response.message
      }

      // Check for timeout errors
      if ( errorMessage.includes( 'timeout' ) || errorMessage.includes( 'Lock wait' ) ) {
        errorMessage = 'Database is busy. Please wait a moment and try again.'
      }

      setError( errorMessage )
    }
  }

  const isLoading = createLoading || updateLoading || courseLoading

  if ( isEditMode && courseLoading ) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isEditMode ? 'Update course information' : 'Fill in the details to create a new course'}
        </p>
      </div>

      {error && (
        <Alert type="danger" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" className="mb-6">
          Course {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
        </Alert>
      )}

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Course Title"
            value={formData.title}
            onChange={( e ) => setFormData( { ...formData, title: e.target.value } )}
            required
            placeholder="e.g., Introduction to Web Development"
          />

          <Textarea
            label="Short Introduction"
            value={formData.short_introduction}
            onChange={( e ) => setFormData( { ...formData, short_introduction: e.target.value } )}
            required
            rows={3}
            placeholder="A brief description that appears in course listings"
          />

          <Textarea
            label="Full Description"
            value={formData.description}
            onChange={( e ) => setFormData( { ...formData, description: e.target.value } )}
            required
            rows={6}
            placeholder="Detailed course description, learning objectives, and what students will learn"
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={( e ) => setFormData( { ...formData, category: e.target.value } )}
            options={[
              { value: '', label: 'Select Category' },
              ...( Array.isArray( categories ) ? categories.map( cat => ( {
                value: cat.name || cat,
                label: cat.title || cat.name || cat
              } ) ) : [] )
            ]}
            disabled={categoriesLoading}
          />

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="published"
                type="checkbox"
                checked={formData.published}
                onChange={( e ) => setFormData( { ...formData, published: e.target.checked } )}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Published (visible to students)
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={( e ) => setFormData( { ...formData, featured: e.target.checked } )}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured (show on homepage)
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="enable_certificate"
                type="checkbox"
                checked={formData.enable_certificate}
                onChange={( e ) => setFormData( { ...formData, enable_certificate: e.target.checked } )}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="enable_certificate" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Certificate (issue certificate on completion)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate( -1 )}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading || success}
            >
              {isEditMode ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
