import { createRoot } from 'solid-js'
import { promiseTimeout } from '../src/common'

// I don't know what I'm doing
export const AsyncTest = (fn: (resolve: Function, reject: Function) => void) => {
   const promises: Promise<void>[] = []
   const dispose = createRoot(dispose => {
      promises.push(new Promise(fn))
      return dispose
   })
   promises.push(promiseTimeout(500, true).finally(dispose))
   return Promise.race(promises)
}
