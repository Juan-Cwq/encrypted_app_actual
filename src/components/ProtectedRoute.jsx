import { Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth/sign-in" replace />
  }

  return children
}

export default ProtectedRoute