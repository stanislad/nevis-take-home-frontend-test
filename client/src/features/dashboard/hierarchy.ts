import type { Company, HierarchyNode } from '../../types/business'

export function childrenFor(node: HierarchyNode): readonly HierarchyNode[] {
  if ('branches' in node) return node.branches
  if ('advisors' in node) return node.advisors ?? []
  if ('channels' in node) return node.channels ?? []
  return []
}

export function findNode(root: Company, id: string): HierarchyNode | undefined {
  const pending: HierarchyNode[] = [root]
  while (pending.length > 0) {
    const node = pending.pop()!
    if (node.id === id) return node
    pending.push(...childrenFor(node))
  }
  return undefined
}
