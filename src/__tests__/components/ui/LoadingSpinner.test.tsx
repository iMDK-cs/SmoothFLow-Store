import { render, screen } from '@testing-library/react'
import { LoadingSpinner, Skeleton, LoadingButton } from '@/components/ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    const customText = 'جاري تحميل البيانات...'
    render(<LoadingSpinner text={customText} />)
    expect(screen.getByText(customText)).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />)
    expect(document.querySelector('.w-4')).toBeInTheDocument()

    rerender(<LoadingSpinner size="large" />)
    expect(document.querySelector('.w-12')).toBeInTheDocument()
  })

  it('applies correct color classes', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />)
    expect(document.querySelector('.text-blue-600')).toBeInTheDocument()

    rerender(<LoadingSpinner color="white" />)
    expect(document.querySelector('.text-white')).toBeInTheDocument()
  })
})

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton />)
    expect(document.querySelector('.bg-gray-200')).toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('applies custom width and height', () => {
    render(<Skeleton width="w-32" height="h-8" />)
    expect(document.querySelector('.w-32')).toBeInTheDocument()
    expect(document.querySelector('.h-8')).toBeInTheDocument()
  })

  it('applies rounded style when specified', () => {
    render(<Skeleton rounded />)
    expect(document.querySelector('.rounded-full')).toBeInTheDocument()
  })
})

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(<LoadingButton loading={false}>Click me</LoadingButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<LoadingButton loading={true}>Click me</LoadingButton>)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('is disabled when loading', () => {
    render(<LoadingButton loading={true}>Click me</LoadingButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<LoadingButton loading={false} disabled={true}>Click me</LoadingButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick when clicked and not disabled', () => {
    const handleClick = jest.fn()
    render(
      <LoadingButton loading={false} onClick={handleClick}>
        Click me
      </LoadingButton>
    )
    
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when loading', () => {
    const handleClick = jest.fn()
    render(
      <LoadingButton loading={true} onClick={handleClick}>
        Click me
      </LoadingButton>
    )
    
    screen.getByRole('button').click()
    expect(handleClick).not.toHaveBeenCalled()
  })
})