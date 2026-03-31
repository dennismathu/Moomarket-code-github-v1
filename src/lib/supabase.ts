import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

/**
 * Fetch wrapper that adds a 10-second timeout and up to 3 retries with
 * exponential back-off for transient network failures (DX-03).
 *
 * Only retries on genuine network errors (TypeError) or 5xx server errors —
 * never on 4xx client errors (auth failures, RLS violations, etc.).
 */
async function fetchWithRetry(
    input: RequestInfo | URL,
    init?: RequestInit,
    attempt = 0
): Promise<Response> {
    const MAX_RETRIES = 3
    const TIMEOUT_MS = 10_000

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const signal = init?.signal
        ? // Merge caller's signal with our timeout signal
        anySignal([init.signal as AbortSignal, controller.signal])
        : controller.signal

    try {
        const response = await fetch(input, { ...init, signal })
        clearTimeout(timer)

        // Retry on 5xx server errors (not on 4xx — those are the caller's problem)
        if (response.status >= 500 && attempt < MAX_RETRIES) {
            await delay(200 * 2 ** attempt)
            return fetchWithRetry(input, init, attempt + 1)
        }

        return response
    } catch (err) {
        clearTimeout(timer)

        // Retry on network errors (TypeError) — not on abort/timeout
        if (err instanceof TypeError && attempt < MAX_RETRIES) {
            await delay(200 * 2 ** attempt)
            return fetchWithRetry(input, init, attempt + 1)
        }

        // Timeout: surface a friendly error
        if ((err as Error)?.name === 'AbortError') {
            throw new Error('Request timed out. Check your internet connection.')
        }

        throw err
    }
}

/** Returns an AbortSignal that fires when ANY of the given signals aborts. */
function anySignal(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController()
    for (const signal of signals) {
        if (signal.aborted) { controller.abort(); break }
        signal.addEventListener('abort', () => controller.abort(), { once: true })
    }
    return controller.signal
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//     global: { fetch: fetchWithRetry as typeof fetch },
// })

// Reverting to default fetch to debug auth hanging issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
