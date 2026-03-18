import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ResetPassword from '../ResetPassword'
import { AuthProvider } from '../../contexts/AuthContext'
import { mockSupabaseRef as mockSupabase } from '../../test/setup'
import { MemoryRouter } from 'react-router-dom'


describe('ResetPassword', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    })

    it('shows invalid link screen if no recovery session or event after 8s', async () => {
        vi.useFakeTimers()
        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthProvider>
                        <ResetPassword />
                    </AuthProvider>
                </MemoryRouter>
            )
        })

        // Initially loading
        expect(screen.getByTestId('auth-spinner')).toBeInTheDocument()

        // Fast-forward past the 8-second timeout
        await act(async () => {
            vi.advanceTimersByTime(8001)
        })

        // Switch back to real timers for waitFor to process any remaining async updates
        vi.useRealTimers()

        await waitFor(() => {
            expect(screen.getByText(/Link Invalid or Expired/i)).toBeInTheDocument()
        }, { timeout: 5000 })
    })

    it('shows password reset form if session exists on mount', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: { id: 'test-id' } } },
            error: null
        })

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthProvider>
                        <ResetPassword />
                    </AuthProvider>
                </MemoryRouter>
            )
        })

        await waitFor(() => {
            expect(screen.getByText(/Set New Password/i)).toBeInTheDocument()
        }, { timeout: 5000 })
    })

    it('shows password reset form if PASSWORD_RECOVERY event fires after mount', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthProvider>
                        <ResetPassword />
                    </AuthProvider>
                </MemoryRouter>
            )
        })

        // Wait for initial load
        await waitFor(() => expect(screen.getByTestId('auth-spinner')).toBeInTheDocument())

        // Simulate recovery event
        await act(async () => {
            (mockSupabase.auth as any)._triggerAuthEvent('PASSWORD_RECOVERY', { user: { id: 'test-id' } })
        })

        await waitFor(() => {
            expect(screen.getByText(/Set New Password/i)).toBeInTheDocument()
        }, { timeout: 5000 })
    })
})
