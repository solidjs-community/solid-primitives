[@solid-primitives/utils](../README.md) / index

# Module: index

## Table of contents

### Type aliases

- [AnyFunction](index.md#anyfunction)
- [AnyObject](index.md#anyobject)
- [DeepPartialAny](index.md#deeppartialany)
- [Destore](index.md#destore)
- [Fn](index.md#fn)
- [ItemsOf](index.md#itemsof)
- [Keys](index.md#keys)
- [Many](index.md#many)
- [MappingFn](index.md#mappingfn)
- [MaybeAccessor](index.md#maybeaccessor)
- [MaybeAccessorValue](index.md#maybeaccessorvalue)
- [Modify](index.md#modify)
- [ModifyDeep](index.md#modifydeep)
- [Predicate](index.md#predicate)
- [PrimitiveValue](index.md#primitivevalue)
- [Values](index.md#values)

### Variables

- [isClient](index.md#isclient)
- [isServer](index.md#isserver)

### Functions

- [access](index.md#access)
- [accessAsArray](index.md#accessasarray)
- [createCallbackStack](index.md#createcallbackstack)
- [destore](index.md#destore)
- [entries](index.md#entries)
- [forEach](index.md#foreach)
- [isDefined](index.md#isdefined)
- [noop](index.md#noop)
- [onRootCleanup](index.md#onrootcleanup)
- [promiseTimeout](index.md#promisetimeout)
- [raceTimeout](index.md#racetimeout)
- [withAccess](index.md#withaccess)

## Type aliases

### AnyFunction

Ƭ **AnyFunction**: (...`args`: `any`[]) => `any`

#### Type declaration

▸ (...`args`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

##### Returns

`any`

#### Defined in

[packages/utils/src/types.ts:58](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L58)

___

### AnyObject

Ƭ **AnyObject**: `Record`<`string`, `any`\>

#### Defined in

[packages/utils/src/types.ts:57](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L57)

___

### DeepPartialAny

Ƭ **DeepPartialAny**<`T`\>: { [P in keyof T]?: T[P] extends AnyObject ? DeepPartialAny<T[P]\> : any }

Makes each property optional and turns each leaf property into any, allowing for type overrides by narrowing any.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[packages/utils/src/types.ts:53](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L53)

___

### Destore

Ƭ **Destore**<`T`\>: { [K in keyof T]: T[K] extends Function ? T[K] : Accessor<T[K]\> }

Destructible store object, with values changed to accessors

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Defined in

[packages/utils/src/types.ts:65](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L65)

___

### Fn

Ƭ **Fn**<`R`\>: () => `R`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `R` | `void` |

#### Type declaration

▸ (): `R`

A function

##### Returns

`R`

#### Defined in

[packages/utils/src/types.ts:6](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L6)

___

### ItemsOf

Ƭ **ItemsOf**<`T`\>: `T` extends infer E[] ? `E` : `never`

Infers the type of the array elements

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[packages/utils/src/types.ts:19](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L19)

___

### Keys

Ƭ **Keys**<`O`\>: keyof `O`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `O` | extends `Object` |

#### Defined in

[packages/utils/src/types.ts:13](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L13)

___

### Many

Ƭ **Many**<`T`\>: `T` \| `T`[]

Can be single or in an array

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[packages/utils/src/types.ts:11](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L11)

___

### MappingFn

Ƭ **MappingFn**<`T`, `V`\>: (`item`: `T`, `index`: `number`, `array`: readonly `T`[]) => `V`

#### Type parameters

| Name |
| :------ |
| `T` |
| `V` |

#### Type declaration

▸ (`item`, `index`, `array`): `V`

##### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `T` |
| `index` | `number` |
| `array` | readonly `T`[] |

##### Returns

`V`

#### Defined in

[packages/utils/src/types.ts:22](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L22)

___

### MaybeAccessor

Ƭ **MaybeAccessor**<`T`\>: `T` \| `Accessor`<`T`\>

T or a reactive/non-reactive function returning T

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[packages/utils/src/types.ts:27](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L27)

___

### MaybeAccessorValue

Ƭ **MaybeAccessorValue**<`T`\>: `T` extends [`Fn`](index.md#fn) ? `ReturnType`<`T`\> : `T`

Accessed value of a MaybeAccessor

**`example`**
MaybeAccessorValue<MaybeAccessor<string>>
// => string
MaybeAccessorValue<MaybeAccessor<() => string>>
// => string | (() => string)
MaybeAccessorValue<MaybeAccessor<string> | Function>
// => string | void

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`MaybeAccessor`](index.md#maybeaccessor)<`any`\> |

#### Defined in

[packages/utils/src/types.ts:38](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L38)

___

### Modify

Ƭ **Modify**<`T`, `R`\>: `Omit`<`T`, keyof `R`\> & `R`

Allows to make shallow overwrites to an interface

#### Type parameters

| Name |
| :------ |
| `T` |
| `R` |

#### Defined in

[packages/utils/src/types.ts:41](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L41)

___

### ModifyDeep

Ƭ **ModifyDeep**<`A`, `B`\>: { [K in keyof A]: B[K] extends never ? A[K] : B[K] extends AnyObject ? ModifyDeep<A[K], B[K]\> : B[K] } & `A` extends [`AnyObject`](index.md#anyobject) ? `Omit`<`B`, keyof `A`\> : `A`

Allows to make nested overwrites to an interface

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | extends [`AnyObject`](index.md#anyobject) |
| `B` | extends [`DeepPartialAny`](index.md#deeppartialany)<`A`\> |

#### Defined in

[packages/utils/src/types.ts:44](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L44)

___

### Predicate

Ƭ **Predicate**<`T`\>: (`item`: `T`, `index`: `number`, `array`: readonly `T`[]) => `boolean`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`item`, `index`, `array`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `T` |
| `index` | `number` |
| `array` | readonly `T`[] |

##### Returns

`boolean`

#### Defined in

[packages/utils/src/types.ts:21](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L21)

___

### PrimitiveValue

Ƭ **PrimitiveValue**: `string` \| `boolean` \| `number` \| `bigint` \| `symbol` \| ``null`` \| `undefined`

#### Defined in

[packages/utils/src/types.ts:60](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L60)

___

### Values

Ƭ **Values**<`O`\>: `O`[[`Keys`](index.md#keys)<`O`\>]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `O` | extends `Object` |

#### Defined in

[packages/utils/src/types.ts:14](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/types.ts#L14)

## Variables

### isClient

• **isClient**: ``true``

#### Defined in

[packages/utils/src/index.ts:14](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L14)

___

### isServer

• **isServer**: ``false``

#### Defined in

node_modules/solid-js/web/types/index.d.ts:5

## Functions

### access

▸ `Const` **access**<`T`\>(`v`): [`MaybeAccessorValue`](index.md#maybeaccessorvalue)<`T`\>

Accesses the value of a MaybeAccessor

**`example`**
access("foo") // => "foo"
access(() => "foo") // => "foo"

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `T` |

#### Returns

[`MaybeAccessorValue`](index.md#maybeaccessorvalue)<`T`\>

#### Defined in

[packages/utils/src/index.ts:29](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L29)

___

### accessAsArray

▸ `Const` **accessAsArray**<`T`, `V`\>(`value`): `V` extends `any`[] ? `V` : `V`[]

Accesses the value of a MaybeAccessor, but always returns an array

**`example`**
accessAsArray('abc') // => ['abc']
accessAsArray(() => 'abc') // => ['abc']
accessAsArray([1,2,3]) // => [1,2,3]
accessAsArray(() => [1,2,3]) // => [1,2,3]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `unknown` |
| `V` | [`MaybeAccessorValue`](index.md#maybeaccessorvalue)<`T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

#### Returns

`V` extends `any`[] ? `V` : `V`[]

#### Defined in

[packages/utils/src/index.ts:40](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L40)

___

### createCallbackStack

▸ `Const` **createCallbackStack**<`A0`, `A1`, `A2`, `A3`\>(): `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A0` | `void` |
| `A1` | `void` |
| `A2` | `void` |
| `A3` | `void` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `clear` | [`Fn`](index.md#fn)<`void`\> |
| `execute` | (`arg0`: `A0`, `arg1`: `A1`, `arg2`: `A2`, `arg3`: `A3`) => `void` |
| `push` | (...`callbacks`: [`Fn`](index.md#fn)<`void`\>[]) => `void` |

#### Defined in

[packages/utils/src/index.ts:211](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L211)

___

### destore

▸ **destore**<`T`\>(`store`): [`Destore`](index.md#destore)<`T`\>

Allows the Solid's store to be destructured

**`example`**
const [state, setState] = createStore({
  count: 0,
  get double() { return this.count * 2 },
})
const { count, double } = destore(state)
// use it like a signal:
count()

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `store` | `Store`<`T`\> |

#### Returns

[`Destore`](index.md#destore)<`T`\>

Destructible object, with values changed to accessors

#### Defined in

[packages/utils/src/index.ts:160](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L160)

___

### entries

▸ `Const` **entries**<`A`, `V`\>(`object`): [`string`, [`Values`](index.md#values)<`V`\>][]

Get `Object.entries()` of an MaybeAccessor<Object>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | extends [`MaybeAccessor`](index.md#maybeaccessor)<`Object`\> |
| `V` | [`MaybeAccessorValue`](index.md#maybeaccessorvalue)<`A`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `A` |

#### Returns

[`string`, [`Values`](index.md#values)<`V`\>][]

#### Defined in

[packages/utils/src/index.ts:80](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L80)

___

### forEach

▸ `Const` **forEach**<`A`, `V`\>(`array`, `iterator`): `void`

Quickly iterate over an MaybeAccessor<any>

**`example`**
const myFunc = (source: MaybeAccessor<string[]>) => {
   forEach(source, item => console.log(item))
}

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | extends `unknown` |
| `V` | [`MaybeAccessorValue`](index.md#maybeaccessorvalue)<`A`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `array` | `A` |
| `iterator` | (`item`: `V` extends `any`[] ? [`ItemsOf`](index.md#itemsof)<`V`\> : `V`, `index`: `number`, `array`: `V` extends `any`[] ? `V` : `V`[]) => `void` |

#### Returns

`void`

#### Defined in

[packages/utils/src/index.ts:68](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L68)

___

### isDefined

▸ `Const` **isDefined**<`T`\>(`value`): value is T

`if (typeof value !== "undefined" && value !== null)`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `undefined` \| ``null`` \| `T` |

#### Returns

value is T

#### Defined in

[packages/utils/src/index.ts:20](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L20)

___

### noop

▸ `Const` **noop**(...`a`): `void`

no operation

#### Parameters

| Name | Type |
| :------ | :------ |
| `...a` | `any`[] |

#### Returns

`void`

#### Defined in

[packages/utils/src/index.ts:13](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L13)

___

### onRootCleanup

▸ `Const` **onRootCleanup**(`fn`): () => `void`

Solid's `onCleanup` that runs only if there is a root.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `void` |

#### Returns

`fn`

▸ (): `void`

onCleanup - run an effect once before the reactive scope is disposed

**`description`** https://www.solidjs.com/docs/latest/api#oncleanup

##### Returns

`void`

#### Defined in

[packages/utils/src/index.ts:172](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L172)

___

### promiseTimeout

▸ `Const` **promiseTimeout**(`ms`, `throwOnTimeout?`, `reason?`): `Promise`<`void`\>

Creates a promise that resolves *(or rejects)* after gives time.

**`example`**
await promiseTimeout(1500) // will resolve void after timeout
await promiseTimeout(1500, true, 'rejection reason') // will reject 'rejection reason' after timout

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `ms` | `number` | `undefined` | timeout duration in ms |
| `throwOnTimeout` | `boolean` | `false` | promise will be rejected on timeout if set to `true` |
| `reason` | `string` | `"Timeout"` | rejection reason |

#### Returns

`Promise`<`void`\>

Promise<void>

#### Defined in

[packages/utils/src/index.ts:96](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L96)

___

### raceTimeout

▸ **raceTimeout**<`T`\>(`promises`, `ms`, `throwOnTimeout`, `reason?`): `T` extends `any`[] ? `Promise`<`Awaited`<`T`[`number`]\>\> : `Promise`<`Awaited`<`T`\>\>

Combination of `Promise.race()` and `promiseTimeout`.

**`example`**
// single promise
await raceTimeout(new Promise(() => {...}), 3000)
// list of promises racing
await raceTimeout([new Promise(),new Promise()...], 3000)
// reject on timeout
await raceTimeout(new Promise(), 3000, true, 'rejection reason')

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `promises` | `T` | single promise, or array of promises |
| `ms` | `number` | timeout duration in ms |
| `throwOnTimeout` | ``true`` | promise will be rejected on timeout if set to `true` |
| `reason?` | `string` | rejection reason |

#### Returns

`T` extends `any`[] ? `Promise`<`Awaited`<`T`[`number`]\>\> : `Promise`<`Awaited`<`T`\>\>

a promise resulting in value of the first source promises to be resolved

#### Defined in

[packages/utils/src/index.ts:122](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L122)

▸ **raceTimeout**<`T`\>(`promises`, `ms`, `throwOnTimeout?`, `reason?`): `T` extends `any`[] ? `Promise`<`Awaited`<`T`[`number`]\> \| `undefined`\> : `Promise`<`Awaited`<`T`\> \| `undefined`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `promises` | `T` |
| `ms` | `number` |
| `throwOnTimeout?` | `boolean` |
| `reason?` | `string` |

#### Returns

`T` extends `any`[] ? `Promise`<`Awaited`<`T`[`number`]\> \| `undefined`\> : `Promise`<`Awaited`<`T`\> \| `undefined`\>

#### Defined in

[packages/utils/src/index.ts:128](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L128)

___

### withAccess

▸ `Const` **withAccess**<`T`, `A`, `V`\>(`value`, `fn`): `void`

Run the function if the accessed value is not `undefined` nor `null`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `A` | `A` |
| `V` | [`MaybeAccessorValue`](index.md#maybeaccessorvalue)<`A`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `A` |
| `fn` | (`value`: `NonNullable`<`V`\>) => `void` |

#### Returns

`void`

#### Defined in

[packages/utils/src/index.ts:52](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/index.ts#L52)
