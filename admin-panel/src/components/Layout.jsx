import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex min-h-screen bg-mesh relative overflow-hidden">
            {/* Background elements for aesthetic */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <Sidebar />
            <main className="flex-1 ml-[320px] p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-[1200px] mx-auto min-h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
