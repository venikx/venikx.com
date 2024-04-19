import { visit } from 'unist-util-visit'
import path from 'node:path'

export function replaceOrgLinks() {
  return transformer

  function transformer(tree: any) {
    visit(tree, 'link', (node: any) => {
      if (node.linkType === 'file' && path.extname(node.rawLink) === '.org') {
        node.rawLink = path.dirname(node.rawLink) + '/'
      }
    })
  }
}
