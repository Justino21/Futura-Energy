declare module 'gsap' {
  export interface TimelineConfig {
    scrollTrigger?: any
    [key: string]: any
  }

  export interface GSAPUtils {
    checkPrefix?: (property: string) => string | null
    [key: string]: any
  }

  export interface Timeline {
    to: (target: any, vars: any, position?: any) => Timeline
    fromTo: (target: any, fromVars: any, toVars: any, position?: any) => Timeline
    kill: () => void
    [key: string]: any
  }

  export interface GSAP {
    timeline: (config?: TimelineConfig) => Timeline
    set: (target: any, vars: any) => void
    fromTo: (target: any, fromVars: any, toVars: any, position?: any) => Timeline
    to: (target: any, vars: any, position?: any) => Timeline
    registerPlugin: (...plugins: any[]) => void
    utils: GSAPUtils
    [key: string]: any
  }

  export const gsap: GSAP
  export default gsap
}

declare module 'gsap/ScrollTrigger' {
  export interface ScrollTriggerConfig {
    trigger?: string | HTMLElement
    start?: string
    end?: string
    scrub?: boolean | number
    pin?: boolean | string | HTMLElement
    anticipatePin?: number
    invalidateOnRefresh?: boolean
    snap?: any
    [key: string]: any
  }

  export interface ScrollTrigger {
    getAll: () => ScrollTriggerInstance[]
    [key: string]: any
  }

  export interface ScrollTriggerInstance {
    vars: {
      trigger?: HTMLElement
      [key: string]: any
    }
    kill: () => void
    [key: string]: any
  }

  export const ScrollTrigger: ScrollTrigger
  export default ScrollTrigger
}

