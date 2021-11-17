import { createRoot, createSignal, createMemo } from 'solid-js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { promiseTimeout } from '../src/common'

import { createCompositeEffect } from '../src/createCompositeEffect'
import { stoppable } from '../src/modifiers'
import { AsyncTest } from './async-test'

// test('watching array of signals', () => {
//    createRoot(dispose => {
//       const [counter, setCounter] = createSignal(0)
//       const [text, setText] = createSignal('')

//       const captured: [number, string][] = []

//       createCompositeEffect([counter, text], x => captured.push(x))

//       setTimeout(() => {
//          setCounter(1)
//          assert.equal(captured[1], [1, ''], 'first assign - number')
//          setText('hello')
//          assert.equal(captured[2], [1, 'hello'], 'second assign - text')
//          dispose()
//       }, 0)
//    })
// })

test('stop watch function', async () =>
   AsyncTest(resolve => {
      const [counter, setCounter] = createSignal(0)

      const captured: number[] = []

      const { stop } = createCompositeEffect(stoppable(counter, x => captured.push(x)))

      setTimeout(() => {
         setCounter(1)
         assert.is(captured[1], 1, 'change before stop')
         stop()
         setCounter(2)
         assert.is(captured[2], undefined, 'change after stop')
         resolve()
      }, 0)
   }))

test.run()
