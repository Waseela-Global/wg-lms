import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useFrappeAuth } from 'frappe-react-sdk'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Lesson from './pages/Lesson'
import Batches from './pages/Batches'
import BatchDetail from './pages/BatchDetail'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Quiz from './pages/Quiz'
import Assignment from './pages/Assignment'
import Discussions from './pages/Discussions'
import DiscussionDetail from './pages/DiscussionDetail'
import Certificates from './pages/Certificates'
import CertificateDetail from './pages/CertificateDetail'
import MyAssignments from './pages/MyAssignments'
import TrainingFeedback from './pages/TrainingFeedback'

// Admin pages
import CourseForm from './pages/Admin/CourseForm'
import BatchForm from './pages/Admin/BatchForm'
import Settings from './pages/Admin/Settings'
import TrainingAssignment from './pages/Admin/TrainingAssignment'
import AssignmentDashboard from './pages/Admin/AssignmentDashboard'

function App() {
    return (
        <BrowserRouter basename="/lms">
            <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

                {/* Public routes */}
                <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                <Route path="/courses" element={<MainLayout><Courses /></MainLayout>} />
                <Route path="/courses/:courseId" element={<MainLayout><CourseDetail /></MainLayout>} />
                <Route path="/batches" element={<MainLayout><Batches /></MainLayout>} />
                <Route path="/batches/:batchId" element={<MainLayout><BatchDetail /></MainLayout>} />

                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
                <Route path="/lesson/:lessonId" element={<ProtectedRoute><MainLayout><Lesson /></MainLayout></ProtectedRoute>} />
                <Route path="/quiz/:quizId" element={<ProtectedRoute><MainLayout><Quiz /></MainLayout></ProtectedRoute>} />
                <Route path="/assignment/:assignmentId" element={<ProtectedRoute><MainLayout><Assignment /></MainLayout></ProtectedRoute>} />
                <Route path="/discussions" element={<ProtectedRoute><MainLayout><Discussions /></MainLayout></ProtectedRoute>} />
                <Route path="/discussions/:discussionId" element={<ProtectedRoute><MainLayout><DiscussionDetail /></MainLayout></ProtectedRoute>} />
                <Route path="/certificates" element={<ProtectedRoute><MainLayout><Certificates /></MainLayout></ProtectedRoute>} />
                <Route path="/certificates/:certificateId" element={<ProtectedRoute><MainLayout><CertificateDetail /></MainLayout></ProtectedRoute>} />
                <Route path="/assignments" element={<ProtectedRoute><MainLayout><MyAssignments /></MainLayout></ProtectedRoute>} />
                <Route path="/feedback/:courseId" element={<ProtectedRoute><MainLayout><TrainingFeedback /></MainLayout></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin/courses/new" element={<ProtectedRoute><MainLayout><CourseForm /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/courses/:courseId/edit" element={<ProtectedRoute><MainLayout><CourseForm /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/batches/new" element={<ProtectedRoute><MainLayout><BatchForm /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/batches/:batchId/edit" element={<ProtectedRoute><MainLayout><BatchForm /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/assignments" element={<ProtectedRoute><MainLayout><AssignmentDashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/assignments/new" element={<ProtectedRoute><MainLayout><TrainingAssignment /></MainLayout></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

function ProtectedRoute( { children } ) {
    const { currentUser, isLoading } = useFrappeAuth()

    if ( isLoading ) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
            </div>
        )
    }

    if ( !currentUser || currentUser === 'Guest' ) {
        return <Navigate to="/login" state={{ from: { pathname: window.location.pathname } }} replace />
    }

    return children
}

export default App

