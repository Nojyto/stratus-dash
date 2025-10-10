import { useEffect, useMemo, useRef } from "react"

type AnyFunction = (...args: unknown[]) => unknown

export const useDebounce = <F extends AnyFunction>(func: F, delay: number) => {
  const funcRef = useRef<F>(func)

  useEffect(() => {
    funcRef.current = func
  }, [func])

  return useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const debouncedFunction = (...args: Parameters<F>): void => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        funcRef.current(...args)
      }, delay)
    }

    return debouncedFunction
  }, [delay])
}
