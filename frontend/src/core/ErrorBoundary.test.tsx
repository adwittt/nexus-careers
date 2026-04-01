import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

const ThrowError = () => {
  throw new Error('Test Error')
}

describe('ErrorBoundary Component', () => {
  it('renders children if no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>All is well</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('All is well')).toBeInTheDocument()
  })

  it('renders the fallback UI when a child throws an error', () => {
    // Suppress console.error in tests to avoid noisy output
    const consoleSpy = vi.spyOn(console, 'error')
    consoleSpy.mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test Error')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
