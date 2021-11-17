import { createRoot } from 'solid-js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { createEffectModifier } from '../src/createEffectModifier'
import { createCompositeEffect } from '../src/createCompositeEffect'

test('creating a modifier', () => {
   createRoot(dispose => {
      const captures: any[] = []
      let captured_config: any = {}
      let captured_source: any
      let captured_stop: any

      const _cb = () => {}
      const _source = () => 0

      const testModifier = createEffectModifier((source, callback, config, stop) => {
         captures.push('mod_cb')
         captured_config = config
         captured_source = source
         captured_stop = stop
         return [callback, { test_return: 'test' }]
      })

      const x = testModifier(_source, _cb)

      assert.is(captures.length, 0, "callback modification shouldn't yet happen")
      assert.is(
         x.initialCallback,
         _cb,
         'initial callback should match the one passed to the modifier',
      )
      assert.is(
         x.initialSource,
         _source,
         'initial source should match the one passed to the modifier',
      )
      assert.is(x.stopRequired, false, "stop shouldn't be required")
      assert.is(x.modifyers.length, 1, 'there should be only one modidier')
      assert.type(x.modifyers[0], 'function', 'callback modifier is a function')

      const [modified_cb, returns] = x.modifyers[0](_cb, () => {})

      assert.is(captures.length, 1, 'callback modifier should be called once')
      assert.is(modified_cb, _cb, "callback shouldn't be changed")
      assert.is(returns.test_return, 'test', 'returns match')

      const returns1 = createCompositeEffect(testModifier(_source, _cb))

      assert.is(
         returns1.test_return,
         'test',
         'modifiers returns should be returned from the createCompositeEffect',
      )
      assert.is(captures.length, 2, 'callback modifier should be called twice at this point')
      assert.equal(captured_config, {}, 'no config should be passed')
      assert.equal(captured_source, _source, 'captured source should math the passed source')
      assert.is(captured_stop, undefined, "stop() shouldn't be passed to modifier")

      createCompositeEffect(testModifier(_source, _cb, { test_config: 123 }))

      assert.equal(
         captured_config,
         { test_config: 123 },
         'captured config should math the passed config',
      )

      dispose()
   })
})

test('creating a modifier with stop() available', () => {
   createRoot(dispose => {
      const captures: any[] = []
      let captured_config: any = {}
      let captured_source: any
      let captured_stop: any

      const _cb = () => {}
      const _source = () => 0

      const testModifier = createEffectModifier<any, any, true>(
         (source, callback, config, stop) => {
            captures.push('mod_cb')
            captured_config = config
            captured_source = source
            captured_stop = stop
            return [callback, { test_return: 'test' }]
         },
         true,
      )

      const x = testModifier(_source as any, _cb)

      assert.is(captures.length, 0, "callback modification shouldn't yet happen")
      assert.is(
         x.initialCallback,
         _cb,
         'initial callback should match the one passed to the modifier',
      )
      assert.is(
         x.initialSource,
         _source,
         'initial source should match the one passed to the modifier',
      )
      assert.is(x.stopRequired, true, 'stop should be required')
      assert.is(x.modifyers.length, 1, 'there should be only one modidier')
      assert.type(x.modifyers[0], 'function', 'callback modifier is a function')

      const [modified_cb, returns] = x.modifyers[0](_cb, () => {})

      assert.is(captures.length, 1, 'callback modifier should be called once')
      assert.is(modified_cb, _cb, "callback shouldn't be changed")
      assert.is(returns.test_return, 'test', 'returns match')

      const returns1 = createCompositeEffect(testModifier(_source as any, _cb))

      assert.is(
         returns1.test_return,
         'test',
         'modifiers returns should be returned from the createCompositeEffect',
      )
      assert.type(
         returns1.stop,
         'undefined',
         'stop() should not be returned from the createCompositeEffect',
      )
      assert.is(captures.length, 2, 'callback modifier should be called twice at this point')
      assert.equal(captured_config, {}, 'no config should be passed')
      assert.equal(captured_source, _source, 'captured source should math the passed source')
      assert.type(captured_stop, 'function', 'stop() should be passed to modifier')

      createCompositeEffect(testModifier(_source, _cb, { test_config: 123 }))

      assert.equal(
         captured_config,
         { test_config: 123 },
         'captured config should math the passed config',
      )

      dispose()
   })
})

test.run()
