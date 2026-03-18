import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '../LoginPage'
import { AuthProvider } from '../../contexts/AuthContext'
import { mockSupabaseRef as mockSupabase } from '../../test/setup'
import { MemoryRouter, Route, Routes } from 'react-router-dom'


describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    })

    it('shows friendly error on invalid credentials', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' }
        })

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthProvider>
                        <LoginPage />
                    </AuthProvider>
                </MemoryRouter>
            )
        })

        await waitFor(() => expect(screen.queryByTestId('auth-spinner')).not.toBeInTheDocument())

        const emailInput = screen.getByPlaceholderText(/you@example.com/i)
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /^sign in$/i })

        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
        })

        await act(async () => {
            fireEvent.click(submitButton)
        })

        await waitFor(() => {
            expect(screen.getByText(/Incorrect email or password/i)).toBeInTheDocument()
        })
    })

    it('locks the form after 5 failed attempts', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' }
        })

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthProvider>
                        <LoginPage />
                    </AuthProvider>
                </MemoryRouter>
            )
        })

        await waitFor(() => expect(screen.queryByTestId('auth-spinner')).not.toBeInTheDocument())

        const emailInput = screen.getByPlaceholderText(/you@example.com/i)
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitButton = screen.getByRole('button', { name: /^sign in$/i })

        // attempts 1-4: should see error message
        for (let i = 0; i < 4; i++) {
            await act(async () => {
                fireEvent.change(emailInput, { target: { value: `test${i}@example.com` } })
                fireEvent.change(passwordInput, { target: { value: 'wrong' } })
            })
            await act(async () => {
                fireEvent.click(submitButton)
            })
            await waitFor(() => expect(screen.getByText(/Incorrect email or password/i)).toBeInTheDocument())
        }

        // 5th attempt: triggers lockout, which HIDES the error message and shows lockout alert
        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'test4@example.com' } })
            fireEvent.change(passwordInput, { target: { value: 'wrong' } })
        })
        await act(async () => {
            fireEvent.click(submitButton)
        })

        await waitFor(() => {
            expect(screen.getByText(/Too many failed attempts/i)).toBeInTheDocument()
            expect(submitButton).toBeDisabled()
            // Verify button text changed
            expect(submitButton).toHaveTextContent(/Locked/i)
        }, { timeout: 5000 })
    })

    it('navigates to redirect param on success', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            data: { user: { id: 'test-id' }, session: { user: { id: 'test-id' } } },
            error: null
        })

        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/login?redirect=/profile']}>
                    <Routes>
                        <Route path="/login" element={
                            <AuthProvider>
                                <LoginPage />
                            </AuthProvider>
                        } />
                        <Route path="/profile" element={<div>Profile Page</div>} />
                    </Routes>
                </MemoryRouter>
            )
        })

        await waitFor(() => expect(screen.queryByTestId('auth-spinner')).not.toBeInTheDocument())

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@example.com' } })
            fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'correctpassword' } })
        })

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
        })

        await waitFor(() => {
            expect(screen.getByText('Profile Page')).toBeInTheDocument()
        }, { timeout: 5000 })
    })
})
