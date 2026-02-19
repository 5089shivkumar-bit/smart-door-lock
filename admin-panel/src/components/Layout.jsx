import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex min-h-screen bg-[#0b0f19]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
