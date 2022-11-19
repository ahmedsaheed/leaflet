import * as React from 'react'

/**
 * Helper function to retrieve a theme context.
 * FROM: https://github.com/rfoel/use-prefers-color-scheme/blob/main/src/index.ts
 * 
 * 
 */
export const usePrefersColorScheme = () => {
  const [preferredColorSchema, setPreferredColorSchema] = React.useState<
    'dark' | 'light' | 'no-preference'
  >('no-preference')

  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)')
    const isLight = window.matchMedia('(prefers-color-scheme: light)')
    setPreferredColorSchema(
      isDark.matches ? 'dark' : isLight.matches ? 'light' : 'no-preference'
    )
    if (typeof isLight.addEventListener === 'function') {
      const darkListener = ({ matches }: MediaQueryListEvent) => {
        matches && setPreferredColorSchema('dark')
      }
      const lightListener = ({ matches }: MediaQueryListEvent) => {
        matches && setPreferredColorSchema('light')
      }
      isDark.addEventListener('change', darkListener)
      isLight.addEventListener('change', lightListener)
      return () => {
        isDark.removeEventListener('change', darkListener)
        isLight.removeEventListener('change', lightListener)
      }
    }

    if (typeof isLight.addListener === 'function') {
      const listener = () =>
        setPreferredColorSchema(
          isDark.matches ? 'dark' : isLight.matches ? 'light' : 'no-preference'
        )
      isDark.addListener(listener)
      isLight.addListener(listener)
      return () => {
        isDark.removeListener(listener)
        isLight.removeListener(listener)
      }
    }
    return
  }, [])

  return preferredColorSchema
}
