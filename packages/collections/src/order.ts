/** An immutable AVL index. Historical cursors retain slot names, not user keys. */
export interface OrderNode {
  readonly id: number;
  readonly slot: string;
  readonly left: Order;
  readonly right: Order;
  readonly height: number;
}
export type Order = OrderNode | undefined;

const height = (node: Order): number => node?.height ?? 0;
const node = (id: number, slot: string, left: Order, right: Order): OrderNode => ({
  id,
  slot,
  left,
  right,
  height: 1 + Math.max(height(left), height(right)),
});
function balance(id: number, slot: string, left: Order, right: Order): OrderNode {
  if (height(left) > height(right) + 1) {
    const l = left!;
    if (height(l.left) >= height(l.right))
      return node(l.id, l.slot, l.left, node(id, slot, l.right, right));
    const middle = l.right!;
    return node(
      middle.id,
      middle.slot,
      node(l.id, l.slot, l.left, middle.left),
      node(id, slot, middle.right, right),
    );
  }
  if (height(right) > height(left) + 1) {
    const r = right!;
    if (height(r.right) >= height(r.left))
      return node(r.id, r.slot, node(id, slot, left, r.left), r.right);
    const middle = r.left!;
    return node(
      middle.id,
      middle.slot,
      node(id, slot, left, middle.left),
      node(r.id, r.slot, middle.right, r.right),
    );
  }
  return node(id, slot, left, right);
}
export function insert(root: Order, id: number, slot: string): OrderNode {
  if (!root) return node(id, slot, undefined, undefined);
  // Ordinals always increase, including across rollback: only append is needed.
  return balance(root.id, root.slot, root.left, insert(root.right, id, slot));
}
export function remove(root: OrderNode, id: number): Order {
  if (id < root.id) return balance(root.id, root.slot, remove(root.left!, id), root.right);
  if (id > root.id) return balance(root.id, root.slot, root.left, remove(root.right!, id));
  if (!root.left) return root.right;
  if (!root.right) return root.left;
  let next = root.right;
  while (next.left) next = next.left;
  return balance(next.id, next.slot, root.left, remove(root.right, next.id));
}
export function build(
  entries: readonly { id: number; slot: string }[],
  start: number = 0,
  end: number = entries.length,
): Order {
  if (start === end) return undefined;
  const middle = (start + end) >>> 1;
  const entry = entries[middle]!;
  return node(entry.id, entry.slot, build(entries, start, middle), build(entries, middle + 1, end));
}
/** Seek strictly after a consumed ordinal; subsequent pops walk in O(1) amortized. */
export function seek(root: Order, after: number, stack: OrderNode[]): void {
  stack.length = 0;
  while (root) {
    if (root.id > after) {
      stack.push(root);
      root = root.left;
    } else root = root.right;
  }
}
export function advance(stack: OrderNode[]): OrderNode | undefined {
  const current = stack.pop();
  let next = current?.right;
  while (next) {
    stack.push(next);
    next = next.left;
  }
  return current;
}
