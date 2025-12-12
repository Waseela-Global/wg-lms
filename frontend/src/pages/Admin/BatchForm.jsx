import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFrappePostCall, useFrappeGetCall } from 'frappe-react-sdk'
import { API_ENDPOINTS } from '../../utils/api'
import { Button, Input, Textarea, Select, Card, Alert, Spinner } from '../../components/FrappeUI'

export default function BatchForm() {
  const { batchId } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!batchId
  
  const { call: createBatch, loading: createLoading } = useFrappePostCall(API_ENDPOINTS.CREATE_BATCH)
  const { call: updateBatch, loading: updateLoading } = useFrappePostCall(API_ENDPOINTS.UPDATE_BATCH)
  
  // Load batch data if editing
  const { data: batchData, isLoading: batchLoading } = useFrappeGetCall(
    API_ENDPOINTS.GET_BATCH_DETAIL,
    { batch: batchId },
    batchId ? `batch-${batchId}` : null,
    { revalidateOnFocus: false }
  )
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    timezone: 'Asia/Karachi',
    medium: 'Online',
    seat_count: '',
    published: false,
    allow_self_enrollment: false,
  })
  
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState(false)
  
  // Load batch data when editing
  React.useEffect(() => {
    if (batchData && isEditMode) {
      setFormData({
        title: batchData.title || '',
        description: batchData.description || '',
        start_date: batchData.start_date || '',
        end_date: batchData.end_date || '',
        start_time: batchData.start_time || '',
        end_time: batchData.end_time || '',
        timezone: batchData.timezone || 'Asia/Karachi',
        medium: batchData.medium || 'Online',
        seat_count: batchData.seat_count || '',
        published: batchData.published || false,
        allow_self_enrollment: batchData.allow_self_enrollment || false,
      })
    }
  }, [batchData, isEditMode])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    
    try {
      const data = {
        ...formData,
        seat_count: parseInt(formData.seat_count) || 0,
        published: formData.published ? 1 : 0,
        allow_self_enrollment: formData.allow_self_enrollment ? 1 : 0,
      }
      
      if (isEditMode) {
        await updateBatch({ batch: batchId, data })
      } else {
        await createBatch({ data })
      }
      
      setSuccess(true)
      setTimeout(() => {
      navigate('/batches')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to save batch. Please try again.')
    }
  }
  
  const isLoading = createLoading || updateLoading || batchLoading
  
  if (isEditMode && batchLoading) {
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
          {isEditMode ? 'Edit Batch' : 'Create New Batch'}
      </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isEditMode ? 'Update batch information' : 'Fill in the details to create a new learning batch'}
        </p>
      </div>
      
      {error && (
        <Alert type="danger" className="mb-6">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert type="success" className="mb-6">
          Batch {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
        </Alert>
      )}
      
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Batch Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Web Development Bootcamp - January 2025"
          />
          
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            placeholder="Describe the batch, its goals, and what students will learn"
          />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            
            <Input
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Start Time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
            
            <Input
              label="End Time"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Medium"
              value={formData.medium}
              onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
              options={[
                { value: 'Online', label: 'Online' },
                { value: 'Offline', label: 'Offline' }
              ]}
            />
          
            <Input
              label="Seat Count"
              type="number"
              value={formData.seat_count}
              onChange={(e) => setFormData({ ...formData, seat_count: e.target.value })}
              min="0"
              placeholder="Maximum number of students"
            />
          </div>
          
          <Input
            label="Timezone"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            placeholder="e.g., Asia/Karachi"
          />
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="published"
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
            />
              <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Published (visible to students)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="allow_self_enrollment"
              type="checkbox"
              checked={formData.allow_self_enrollment}
              onChange={(e) => setFormData({ ...formData, allow_self_enrollment: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
            />
              <label htmlFor="allow_self_enrollment" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Allow Self Enrollment (students can enroll themselves)
            </label>
          </div>
        </div>
        
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
            type="button"
              variant="secondary"
            onClick={() => navigate(-1)}
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
              {isEditMode ? 'Update Batch' : 'Create Batch'}
            </Button>
        </div>
      </form>
      </Card>
    </div>
  )
}
