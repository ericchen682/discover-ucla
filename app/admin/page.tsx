'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminForm from '@/components/AdminForm'


export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would be more secure
    // For MVP, we'll use a simple password check
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (password === adminPassword) {
      setIsAuthenticated(true)
    } else {
      alert('Incorrect password')
      setPassword('')
    }
  }


  const handleSuccess = () => {
    // Optionally redirect or refresh
    router.refresh()
  }


  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-ucla-blue mb-4">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-ucla-blue text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    )
  }


  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-ucla-blue text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Admin - Add Event</h1>
          <p className="text-blue-100 mt-1">Create a new event for the calendar</p>
        </div>
      </header>


      <div className="container mx-auto px-4 py-8">
        <AdminForm password={password} onSuccess={handleSuccess} />
      </div>
    </main>
  )
}



