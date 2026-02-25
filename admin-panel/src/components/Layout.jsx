import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-300">
            {/* Sidebar remains fixed */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-[240px] p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
