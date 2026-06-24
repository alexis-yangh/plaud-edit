export default function PlaudLogo({
  className = '',
  variant = 'black',
}: {
  className?: string
  variant?: 'black' | 'white'
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/plaud-logo-black.png"
      alt="Plaud"
      className={`w-auto ${variant === 'white' ? 'brightness-0 invert' : ''} ${className}`}
    />
  )
}
