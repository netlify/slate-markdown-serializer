import parser from "./parser";
import { Value } from "slate";
import { Record } from "immutable";
import { encode } from "./urls";

const String = new Record({
  kind: "string",
  text: ""
});

/**
 * Rules to (de)serialize nodes.
 *
 * @type {Object}
 */

let tableHeader = "";

const RULES = [
  {
    serialize(obj, children) {
      if (obj.kind === "string") {
        return children;
      }
    }
  },
  {
    serialize(obj, children, document) {
      if (obj.kind !== "block") return;
      let parent = document.getParent(obj.key);

      switch (obj.type) {
        case "table":
          tableHeader = "";
          return children;
        case "table-head": {
          switch (obj.getIn(["data", "align"])) {
            case "left":
              tableHeader += "|:--- ";
              break;
            case "center":
              tableHeader += "|:---:";
              break;
            case "right":
              tableHeader += "| ---:";
              break;
            default:
              tableHeader += "| --- ";
          }
          return `| ${children} `;
        }
        case "table-row":
          let output = "";
          if (tableHeader) {
            output = `${tableHeader}|\n`;
            tableHeader = "";
          }
          return `${children}|\n${output}`;
        case "table-cell":
          return `| ${children} `;
        case "paragraph":
          if (parent.type === "list-item") {
            return children;
          } else {
            return `\n${children}\n`;
          }
        case "code":
          return `\`\`\`\n${children}\n\`\`\`\n`;
        case "code-line":
          return `${children}\n`;
        case "block-quote":
          return `> ${children}\n`;
        case "todo-list":
        case "bulleted-list":
        case "ordered-list":
          if (parent === document) {
            return children;
          }
          return `\n${children.replace(/^/gm, "   ")}`;
        case "list-item": {
          switch (parent.type) {
            case "ordered-list":
              return `1. ${children}\n`;
            case "todo-list":
              let checked = obj.getIn(["data", "checked"]);
              let box = checked ? "[x]" : "[ ]";
              return `${box} ${children}\n`;
            default:
            case "bulleted-list":
              return `* ${children}\n`;
          }
        }
        case "heading1":
          return `# ${children}`;
        case "heading2":
          return `## ${children}`;
        case "heading3":
          return `### ${children}`;
        case "heading4":
          return `#### ${children}`;
        case "heading5":
          return `##### ${children}`;
        case "heading6":
          return `###### ${children}`;
        case "heading6":
          return `###### ${children}`;
        case "horizontal-rule":
          return `---\n`;
        case "image":
          const alt = obj.getIn(["data", "alt"]);
          const src = encode(obj.getIn(["data", "src"]) || "");
          return `![${alt}](${src})\n`;
      }
    }
  },
  {
    serialize(obj, children) {
      if (obj.kind !== "inline") return;
      switch (obj.type) {
        case "link":
          const href = encode(obj.getIn(["data", "href"]) || "");
          return `[${children.trim()}](${href})`;
      }
    }
  },
  // Add a new rule that handles marks...
  {
    serialize(obj, children) {
      if (obj.kind !== "mark") return;
      switch (obj.type) {
        case "bold":
          return `**${children}**`;
        case "italic":
          return `*${children}*`;
        case "code":
          return `\`${children}\``;
        case "inserted":
          return `__${children}__`;
        case "deleted":
          return `~~${children}~~`;
      }
    }
  }
];

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
    this.rules = [...(options.rules || []), ...RULES];

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
    const { document } = state;
    const elements = document.nodes.map(node =>
      this.serializeNode(node, document)
    );

    const output = elements.join("\n");

    // trim beginning whitespace
    return output.replace(/^\s+/g, "");
  }

  /**
   * Serialize a `node`.
   *
   * @param {Node} node
   * @return {String}
   */

  serializeNode(node, document) {
    if (node.kind == "text") {
      const ranges = node.getRanges();
      return ranges.map(this.serializeRange);
    }

    let children = node.nodes.map(node => this.serializeNode(node, document));
    children = children.flatten().length === 0
      ? ""
      : children.flatten().join("");

    for (const rule of this.rules) {
      if (!rule.serialize) continue;
      const ret = rule.serialize(node, children, document);
      if (ret) return ret;
    }
  }

  /**
   * Serialize a `range`.
   *
   * @param {Range} range
   * @return {String}
   */

  serializeRange(range) {
    const string = new String({ text: range.text });
    const text = this.serializeString(string);

    return range.marks.reduce((children, mark) => {
      for (const rule of this.rules) {
        if (!rule.serialize) continue;
        const ret = rule.serialize(mark, children);
        if (ret) return ret;
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
      if (!rule.serialize) continue;
      const ret = rule.serialize(string, string.text);
      if (ret) return ret;
    }
  }

  /**
   * Deserialize a markdown `string`.
   *
   * @param {String} markdown
   * @return {State} state
   */
  deserialize(markdown) {
    const document = parser.parse(markdown);
    const state = Value.fromJSON({ document });
    return state;
  }
}

export default Markdown;
