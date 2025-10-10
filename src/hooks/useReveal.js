import { useEffect } from 'react'

export default function useReveal(selector = '.reveal', options = {}){
  useEffect(() => {
    if (typeof window === 'undefined') return

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const els = Array.from(document.querySelectorAll(selector))
    if (!('IntersectionObserver' in window) || els.length === 0) return

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in')
          io.unobserve(entry.target)
        }
      })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15, ...options })

    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [selector])
}
