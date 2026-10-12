export interface HeapNode {
  columnIndex: number;
  height: number;
}

/**
 * Zero-allocation Binary Min-Heap for O(log K) shortest column retrieval in Masonry layouts.
 */
export class ColumnMinHeap {
  private nodes: HeapNode[];

  constructor(columnCount: number) {
    this.nodes = new Array(columnCount);
    for (let i = 0; i < columnCount; i++) {
      this.nodes[i] = { columnIndex: i, height: 0 };
    }
  }

  get min(): HeapNode {
    return this.nodes[0]!;
  }

  reset(): void {
    const len = this.nodes.length;
    for (let i = 0; i < len; i++) {
      const n = this.nodes[i]!;
      n.columnIndex = i;
      n.height = 0;
    }
  }

  addHeight(additionalHeight: number): number {
    const root = this.nodes[0]!;
    const chosenColumn = root.columnIndex;
    root.height += additionalHeight;
    this.siftDown(0);
    return chosenColumn;
  }

  private siftDown(index: number): void {
    const len = this.nodes.length;
    const half = len >>> 1;
    const node = this.nodes[index]!;

    while (index < half) {
      let left = (index << 1) + 1;
      const right = left + 1;
      let bestChild = this.nodes[left]!;

      if (right < len && this.nodes[right]!.height < bestChild.height) {
        left = right;
        bestChild = this.nodes[right]!;
      }

      if (node.height <= bestChild.height) {
        break;
      }

      this.nodes[index] = bestChild;
      index = left;
    }
    this.nodes[index] = node;
  }
}
