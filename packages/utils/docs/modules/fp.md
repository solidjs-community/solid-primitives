[@solid-primitives/utils](../README.md) / fp

# Module: fp

## Table of contents

### Functions

- [drop](fp.md#drop)
- [filter](fp.md#filter)
- [filterOut](fp.md#filterout)
- [map](fp.md#map)
- [omit](fp.md#omit)
- [pick](fp.md#pick)
- [push](fp.md#push)
- [slice](fp.md#slice)
- [splice](fp.md#splice)
- [withArrayCopy](fp.md#witharraycopy)
- [withCopy](fp.md#withcopy)
- [withObjectCopy](fp.md#withobjectcopy)

## Functions

### drop

▸ `Const` **drop**<`T`\>(`list`, `n?`): `T`[]

non-mutating function that drops n items from the array start.

**`example`**
```ts
const newList = drop([1,2,3])
newList // => [2,3]

const newList = drop([1,2,3], 2)
newList // => [3]
```

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `list` | `T`[] | `undefined` |
| `n` | `number` | `1` |

#### Returns

`T`[]

changed array copy

#### Defined in

[packages/utils/src/fp.ts:57](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L57)

___

### filter

▸ **filter**<`T`\>(`list`, `predicate`): `T`[] & { `removed`: `number`  }

non-mutating `Array.prototype.filter()` as a standalone function

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | readonly `T`[] |
| `predicate` | [`Predicate`](index.md#predicate)<`T`\> |

#### Returns

`T`[] & { `removed`: `number`  }

changed array copy

#### Defined in

[packages/utils/src/fp.ts:70](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L70)

___

### filterOut

▸ `Const` **filterOut**<`T`\>(`list`, `item`): `T`[] & { `removed`: `number`  }

non-mutating `Array.prototype.filter()` that filters out passed item

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | readonly `T`[] |
| `item` | `T` |

#### Returns

`T`[] & { `removed`: `number`  }

changed array copy

#### Defined in

[packages/utils/src/fp.ts:63](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L63)

___

### map

▸ `Const` **map**<`T`, `V`\>(`list`, `mapFn`): `V`[]

standalone `Array.prototype.map()` function

#### Type parameters

| Name |
| :------ |
| `T` |
| `V` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | readonly `T`[] |
| `mapFn` | [`MappingFn`](index.md#mappingfn)<`T`, `V`\> |

#### Returns

`V`[]

#### Defined in

[packages/utils/src/fp.ts:79](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L79)

___

### omit

▸ `Const` **omit**<`O`, `K`\>(`object`, ...`keys`): `Omit`<`O`, `K`\>

Create a new subset object without the provided keys

**`example`**
```ts
const newObject = omit({ a:"foo", b:"bar", c: "baz" }, 'a', 'b')
newObject // => { c: "baz" }
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `O` | extends `object` |
| `K` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `O` |
| `...keys` | `K`[] |

#### Returns

`Omit`<`O`, `K`\>

#### Defined in

[packages/utils/src/fp.ts:103](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L103)

___

### pick

▸ `Const` **pick**<`O`, `K`\>(`object`, ...`keys`): `Pick`<`O`, `K`\>

Create a new subset object with only the provided keys

**`example`**
```ts
const newObject = pick({ a:"foo", b:"bar", c: "baz" }, 'a', 'b')
newObject // => { a:"foo", b:"bar" }
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `O` | extends `object` |
| `K` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `O` |
| `...keys` | `K`[] |

#### Returns

`Pick`<`O`, `K`\>

#### Defined in

[packages/utils/src/fp.ts:115](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L115)

___

### push

▸ `Const` **push**<`T`\>(`list`, `item`): `T`[]

non-mutating `Array.prototype.push()`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `T`[] |
| `item` | `T` |

#### Returns

`T`[]

changed array copy

#### Defined in

[packages/utils/src/fp.ts:42](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L42)

___

### slice

▸ `Const` **slice**<`T`\>(`list`, `start?`, `end?`): `T`[]

standalone `Array.prototype.slice()` function

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | readonly `T`[] |
| `start?` | `number` |
| `end?` | `number` |

#### Returns

`T`[]

#### Defined in

[packages/utils/src/fp.ts:84](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L84)

___

### splice

▸ `Const` **splice**<`T`\>(`list`, `start`, `deleteCount`, ...`items`): `T`[]

non-mutating `Array.prototype.splice()` as a standalone function

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | readonly `T`[] |
| `start` | `number` |
| `deleteCount` | `number` |
| `...items` | `T`[] |

#### Returns

`T`[]

changed array copy

#### Defined in

[packages/utils/src/fp.ts:91](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L91)

___

### withArrayCopy

▸ `Const` **withArrayCopy**<`T`\>(`array`, `mutator`): `T`[]

apply mutations to the an array without changing the original

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `array` | readonly `T`[] | original array |
| `mutator` | (`copy`: `T`[]) => `void` | function applying mutations to the copy of source |

#### Returns

`T`[]

changed array copy

#### Defined in

[packages/utils/src/fp.ts:9](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L9)

___

### withCopy

▸ `Const` **withCopy**<`T`\>(`source`, `mutator`): `T`

apply mutations to the an object/array without changing the original

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | `T` | original object |
| `mutator` | (`copy`: `T`) => `void` | function applying mutations to the copy of source |

#### Returns

`T`

changed object copy

#### Defined in

[packages/utils/src/fp.ts:33](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L33)

___

### withObjectCopy

▸ `Const` **withObjectCopy**<`T`\>(`object`, `mutator`): `T`

apply mutations to the an object without changing the original

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `object` | `T` | original object |
| `mutator` | (`copy`: `T`) => `void` | function applying mutations to the copy of source |

#### Returns

`T`

changed object copy

#### Defined in

[packages/utils/src/fp.ts:21](https://github.com/davedbase/solid-primitives/blob/db2edff/packages/utils/src/fp.ts#L21)
