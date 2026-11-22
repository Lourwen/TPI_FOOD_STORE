
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
                <Outlet />
            </main>

            <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
                Food Store
            </footer>
        </div>
    )
}
