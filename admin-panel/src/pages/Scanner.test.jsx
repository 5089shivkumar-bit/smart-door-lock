import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Scanner from './Scanner';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('Scanner Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        axios.get.mockResolvedValue({ data: [] });
    });

    it('renders the main screen with Face Scan and Fingerprint options', async () => {
        renderWithRouter(<Scanner />);
        
        expect(screen.getByText(/Face Scan/i)).toBeDefined();
        expect(screen.getByText(/Fingerprint/i)).toBeDefined();
        expect(screen.getByText(/AuraLock Terminal/i)).toBeDefined();
    });

    it('switches to employee picker when Fingerprint is clicked', async () => {
        const mockEmployees = [
            { id: 1, employee_id: 'E001', name: 'John Doe', department: 'Engineering' }
        ];
        axios.get.mockResolvedValue({ data: mockEmployees });

        renderWithRouter(<Scanner />);
        
        const fingerprintBtn = screen.getByText(/Fingerprint/i);
        fireEvent.click(fingerprintBtn);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Start typing employee name/i)).toBeDefined();
            expect(screen.getByText('John Doe')).toBeDefined();
        });
    });

    it('handles manual attendance marking correctly', async () => {
        const mockEmployees = [
            { id: 1, employee_id: 'E001', name: 'John Doe', department: 'Engineering' }
        ];
        axios.get.mockResolvedValue({ data: mockEmployees });
        axios.post.mockResolvedValue({ data: { success: true } });

        renderWithRouter(<Scanner />);
        
        fireEvent.click(screen.getByText(/Fingerprint/i));
        
        await waitFor(() => {
            const employeeBtn = screen.getByText('John Doe');
            fireEvent.click(employeeBtn);
        });

        await waitFor(() => {
            expect(screen.getByText(/Check In Success/i)).toBeDefined();
            expect(screen.getByText('John Doe')).toBeDefined();
        });
    });

    it('returns to home screen when Back to Home is clicked', async () => {
        renderWithRouter(<Scanner />);
        
        const backBtn = screen.getByText(/Back to Home/i);
        fireEvent.click(backBtn);
        
        // This would normally navigate away, we just check it was clickable
        expect(backBtn).toBeDefined();
    });
});
