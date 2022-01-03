[@solid-primitives/utils](../README.md) / setter

# Module: setter

## Table of contents

### Functions

- [drop](setter.md#drop)
- [filter](setter.md#filter)
- [filterOut](setter.md#filterout)
- [map](setter.md#map)
- [push](setter.md#push)
- [slice](setter.md#slice)
- [splice](setter.md#splice)

## Functions

### drop

▸ `Const` **drop**(`n?`): <T\>(`list`: `T`[]) => `T`[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `n` | `number` | `1` |

#### Returns

`fn`

▸ <`T`\>(`list`): `T`[]

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `T`[] |

##### Returns

`T`[]

#### Defined in

[packages/utils/src/setter.ts:11](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/setter.ts#L11)

___

### filter

▸ `Const` **filter**<`T`\>(`predicate`): (`list`: `T`[]) => `T`[] & { `removed`: `number`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | [`Predicate`](index.md#predicate)<`T`\> |

#### Returns

`fn`

▸ (`list`): `T`[] & { `removed`: `number`  }

##### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `T`[] |

##### Returns

`T`[] & { `removed`: `number`  }

#### Defined in

[packages/utils/src/setter.ts:21](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/setter.ts#L21)

___

### filterOut

▸ `Const` **filterOut**<`T`\>(`item`): (`list`: `T`[]) => `T`[] & { `removed`: `number`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `T` |

#### Returns

`fn`

▸ (`list`): `T`[] & { `removed`: `number`  }

##### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `T`[] |

##### Returns

`T`[] & { `removed`: `number`  }

#### Defined in

[packages/utils/src/setter.ts:16](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/setter.ts#L16)

___

### map

▸ `Const` **map**<`T`\>(`mapFn`): (`list`: `T`[]) => `T`[]

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `mapFn` | [`MappingFn`](index.md#mappingfn)<`T`, `T`\> |

#### Returns

`fn`

▸ (`list`): `T`[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `T`[] |

##### Returns

`T`[]

#### Defined in

[packages/utils/src/setter.ts:26](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/setter.ts#L26)

___

### push

▸ `Const` **push**<`T`\>(`item`): (`list`: `T`[]) => `T`[]

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `T` |

#### Returns

`fn`

▸ (`list`): `T`[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `T`[] |

##### Returns

`T`[]

#### Defined in

[packages/utils/src/setter.ts:6](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/setter.ts#L6)

___

### slice

▸ `Const` **slice**(`start?`, `end?`): <T\>(`list`: `T`[]) => `T`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `start?` | `number` |
| `end?` | `number` |

#### Returns

`fn`

▸ <`T`\>(`list`): `T`[]

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `T`[] |

##### Returns

`T`[]

#### Defined in

[packages/utils/src/setter.ts:31](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/setter.ts#L31)

___

### splice

▸ **splice**(`start`, `deleteCount`): <T\>(`list`: `T`[]) => `T`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `start` | `number` |
| `deleteCount` | `number` |

#### Returns

`fn`

▸ <`T`\>(`list`): `T`[]

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `T`[] |

##### Returns

`T`[]

#### Defined in

[packages/utils/src/setter.ts:36](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/setter.ts#L36)

▸ **splice**<`T`\>(`start`, `deleteCount`, ...`items`): (`list`: `T`[]) => `T`[]

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `start` | `number` |
| `deleteCount` | `number` |
| `...items` | `T`[] |

#### Returns

`fn`

▸ (`list`): `T`[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `T`[] |

##### Returns

`T`[]

#### Defined in

[packages/utils/src/setter.ts:37](https://github.com/davedbase/solid-primitives/blob/ad37021/packages/utils/src/setter.ts#L37)
