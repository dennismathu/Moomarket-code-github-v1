import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers)

// Run cleanup after each test case
afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
})

const authCallbacks: Set<(event: string, session: any) => void> = new Set()

const createQueryMock = () => {
    const mock = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
        eq: vi.fn(),
        single: vi.fn(),
        maybeSingle: vi.fn(),
        match: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
    }

    mock.select.mockReturnThis()
    mock.insert.mockReturnThis()
    mock.update.mockReturnThis()
    mock.upsert.mockReturnThis()
    mock.eq.mockReturnThis()
    mock.match.mockReturnThis()
    mock.order.mockReturnThis()
    mock.limit.mockReturnThis()

    // Default resolutions
    const defaultProfile = { id: 'test-id', role: 'buyer', full_name: 'Test User' }
    mock.single.mockResolvedValue({ data: defaultProfile, error: null })
    mock.maybeSingle.mockResolvedValue({ data: defaultProfile, error: null })

    return mock
}

export const mockSupabase = {
    auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn((cb) => {
            authCallbacks.add(cb)
            return {
                data: {
                    subscription: {
                        unsubscribe: () => authCallbacks.delete(cb)
                    }
                }
            }
        }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        // Helper to trigger events to all subscribers
        _triggerAuthEvent: (event: string, session: any) => {
            authCallbacks.forEach(cb => cb(event, session))
        }
    },
    from: vi.fn(() => createQueryMock())
}

// Global mock for our supabase client.
vi.mock('../lib/supabase', () => ({
    supabase: mockSupabase
}))

// Export mock for use in individual tests
export { mockSupabase as mockSupabaseRef }
