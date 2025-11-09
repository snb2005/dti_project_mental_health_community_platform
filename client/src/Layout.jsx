import React from 'react'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-4">
        <Outlet />
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  )
}

export default Layout