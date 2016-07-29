import { Record } from 'immutable'

/**
 * String.
 */

const String = new Record({
  kind: 'string',
  text: ''
})

/**
 * A rule to (de)serialize text nodes. This is automatically added to the HTML
 * serializer so that users don't have to worry about text-level serialization.
 *
 * @type {Object}
 */

const TEXT_RULE = {
  serialize(obj, children) {
    if (obj.kind == 'string') {
      return children
    }
  }
}


/**
 * Markdown serializer.
 *
 * @type {Markdown}
 */

class Markdown {

  /**
   * Create a new serializer with `rules`.
   *
   * @param {Object} options
   *   @property {Array} rules
   * @return {Markdown} serializer
   */

  constructor(options = {}) {
    this.rules = [
      ...(options.rules || []),
      TEXT_RULE
    ];

    this.serializeNode = this.serializeNode.bind(this);
    this.serializeRange = this.serializeRange.bind(this);
    this.serializeString = this.serializeString.bind(this);
  }


  /**
   * Serialize a `state` object into an HTML string.
   *
   * @param {State} state
   * @return {String} markdown
   */

  serialize(state) {
    const { document } = state
    const elements = document.nodes.map(this.serializeNode)

    return elements.join('\n').trim();
  }

  /**
   * Serialize a `node`.
   *
   * @param {Node} node
   * @return {String}
   */

  serializeNode(node) {
    if (node.kind == 'text') {
      const ranges = node.getRanges()
      return ranges.map(this.serializeRange)
    }

    let children = node.nodes.map(this.serializeNode);
    children = children.flatten().length === 0 ? '' : children.flatten().join('')

    for (const rule of this.rules) {
      if (!rule.serialize) continue
      const ret = rule.serialize(node, children)
      if (ret) return ret
    }
  }

  /**
   * Serialize a `range`.
   *
   * @param {Range} range
   * @return {String}
   */

  serializeRange(range) {
    const string = new String({ text: range.text })
    const text = this.serializeString(string)

    return range.marks.reduce((children, mark) => {
      for (const rule of this.rules) {
        if (!rule.serialize) continue
        const ret = rule.serialize(mark, children)
        if (ret) return ret
      }
    }, text);
  }

  /**
   * Serialize a `string`.
   *
   * @param {String} string
   * @return {String}
   */

  serializeString(string) {
    for (const rule of this.rules) {
      if (!rule.serialize) continue
      const ret = rule.serialize(string, string.text)
      if (ret) return ret
    }
  }

}

/**
 * Export.
 */

export default Markdown
