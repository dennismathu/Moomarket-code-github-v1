import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { mockSupabaseRef as mockSupabase } from '../../test/setup'

const TestComponent = () => {
    const { user, loading } = useAuth()
    if (loading) return <div data-testid="loading">Loading...</div>
    return <div data-testid="user">{user ? user.full_name : 'No User'}</div>
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    })

    it('initially shows loading state', async () => {
        // Create a promise that we control to delay the auth initialization
        let resolveSession: any
        const sessionPromise = new Promise((resolve) => {
            resolveSession = () => resolve({ data: { session: null }, error: null })
        })
        mockSupabase.auth.getSession.mockReturnValue(sessionPromise)

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )
        })

        expect(screen.getByTestId('loading')).toBeInTheDocument()

        // Now resolve it
        await act(async () => {
            resolveSession()
        })

        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
        })
    })

    it('resolves loading after checking session', async () => {
        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )
        })

        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
        }, { timeout: 5000 })
        expect(screen.getByTestId('user')).toHaveTextContent('No User')
    })

    it('fetches profile if session exists on mount', async () => {
        const mockUser = { id: 'test-id', email: 'test@example.com' }
        const mockProfile = { id: 'test-id', full_name: 'Test User', role: 'buyer' }

        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: mockUser } },
            error: null
        })

        const mockQuery = mockSupabase.from() as any
        mockSupabase.from.mockReturnValue(mockQuery)
        mockQuery.maybeSingle.mockResolvedValue({ data: mockProfile, error: null })

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('Test User')
        }, { timeout: 5000 })
    })

    it('handles race condition: loading is false ONLY after profile fetch', async () => {
        const mockUser = { id: 'test-id', email: 'test@example.com' }
        const mockProfile = { id: 'test-id', full_name: 'Test User', role: 'buyer' }

        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: mockUser } },
            error: null
        })

        // Delay resolve
        let resolveProfile: any
        const profilePromise = new Promise((resolve) => {
            resolveProfile = () => resolve({ data: mockProfile, error: null })
        })

        const mockQuery = mockSupabase.from() as any
        mockSupabase.from.mockReturnValue(mockQuery)
        mockQuery.maybeSingle.mockReturnValue(profilePromise)

        await act(async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            )
        })

        expect(screen.getByTestId('loading')).toBeInTheDocument()

        await act(async () => {
            resolveProfile()
        })

        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
            expect(screen.getByTestId('user')).toHaveTextContent('Test User')
        }, { timeout: 5000 })
    })
})
