import { Raw } from 'slate';
import { Record } from 'immutable';

/**
 * Ported from:
 *   https://github.com/chjj/marked/blob/49b7eaca/lib/marked.js
 * TODO:
 *   Use ES6 classes
 *   Add flow annotations
 */
/* eslint-disable no-spaced-func */

var hasOwnProperty = Object.prototype.hasOwnProperty;

var assign = Object.assign || function (obj) {
  var i = 1;
  for (; i < arguments.length; i++) {
    var target = arguments[i];
    for (var key in target) {
      if (hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }
  return obj;
};

var flatten = function flatten(ary) {
  return [].concat.apply([], ary);
};

var noop = function noop() {};
noop.exec = noop;

var defaults = {
  gfm: true,
  breaks: false,
  pedantic: false,
  smartLists: false,
  silent: false,
  langPrefix: 'lang-',
  renderer: new Renderer()
};

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')(/bull/g, block.bullet)();

block.list = replace(block.list)(/bull/g, block.bullet)('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')('def', '\\n+(?=' + block.def.source + ')')();

block.blockquote = replace(block.blockquote)('def', block.def)();

block.paragraph = replace(block.paragraph)('hr', block.hr)('heading', block.heading)('lheading', block.lheading)('blockquote', block.blockquote)('def', block.def)();

/**
 * Normal Block Grammar
 */

block.normal = assign({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = assign({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)('(?!', '(?!' + block.gfm.fences.source.replace('\\1', '\\2') + '|' + block.list.source.replace('\\1', '\\3') + '|')();

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = assign({}, options || defaults);
  this.rules = block.normal;

  if (this.options.gfm) {
    this.rules = block.gfm;
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.parse = function (src, options) {
  var lexer = new Lexer(options);
  return lexer.parse(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.parse = function (src) {
  src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ').replace(/\u00a0/g, ' ').replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function (src, top, bq) {
  var next;
  var loose;
  var cap;
  var bull;
  var b;
  var item;
  var space;
  var i;
  var l;

  src = src.replace(/^ +$/gm, '');

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic ? cap.replace(/\n+$/, '') : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) {
            loose = next;
          }
        }

        this.tokens.push({
          type: loose ? 'loose_item_start' : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // def
    if (!bq && top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  ins: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)('inside', inline._inside)('href', inline._href)();

inline.reflink = replace(inline.reflink)('inside', inline._inside)();

/**
 * Normal Inline Grammar
 */

inline.normal = assign({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = assign({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = assign({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  ins: /^\+\+(?=\S)([\s\S]*?\S)\+\+/,
  text: replace(inline.text)(']|', '~+]|')()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = assign({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = assign({}, options || defaults);
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer();
  this.renderer.options = this.options;

  if (!this.links) {
    throw new Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.parse = function (src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.parse(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.parse = function (src) {
  var out = [];
  var link;
  var cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out.push({
        kind: "text",
        ranges: [{
          text: cap[1]
        }]
      });
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out.push(this.outputLink(cap, { href: cap[2], title: cap[3] }));
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    // TODO
    if ((cap = this.rules.reflink.exec(src)) || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out.push({
          kind: "text",
          ranges: [{
            text: cap[0].charAt(0)
          }]
        });
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out.push(this.outputLink(cap, link));
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out.push(this.renderer.strong(this.parse(cap[2] || cap[1])));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out.push(this.renderer.em(this.parse(cap[2] || cap[1])));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out.push(this.renderer.codespan(cap[2]));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out.push(this.renderer.br());
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out.push(this.renderer.del(this.parse(cap[1])));
      continue;
    }

    // ins (gfm extended)
    if (cap = this.rules.ins.exec(src)) {
      src = src.substring(cap[0].length);
      out.push(this.renderer.ins(this.parse(cap[1])));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out.push(this.renderer.text(cap[0]));
      continue;
    }

    if (src) {
      throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function (cap, link) {
  var href = link.href;
  var title = link.title;

  return cap[0].charAt(0) !== '!' ? this.renderer.link(href, title, this.parse(cap[1])) : this.renderer.image(href, title, cap[1]);
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.groupTextInRanges = function (childNode) {
  var node = flatten(childNode);
  return node.reduce(function (acc, current) {

    if (current instanceof TextNode) {
      var accLast = acc.length - 1;
      if (accLast >= 0 && acc[accLast] && acc[accLast]['kind'] === 'text') {
        // If the previous item was a text kind, push the current text to it's range
        acc[accLast].ranges.push(current);
        return acc;
      } else {
        // Else, create a new text kind
        acc.push({
          kind: "text",
          ranges: [current]
        });
        return acc;
      }
    } else {
      acc.push(current);
      return acc;
    }
  }, []);
};

Renderer.prototype.code = function (childNode, lang) {
  var data = {};
  if (lang) {
    data.language = this.options.langPrefix + lang;
  }
  return {
    kind: "text",
    ranges: [{
      text: childNode,
      marks: [{
        type: "code",
        data: data
      }]
    }]
  };
};

Renderer.prototype.blockquote = function (childNode) {
  return {
    kind: "block",
    type: "block-quote",
    nodes: this.groupTextInRanges(childNode)
  };
};

Renderer.prototype.heading = function (childNode, level) {
  return {
    kind: "block",
    type: "heading" + level,
    nodes: this.groupTextInRanges(childNode)
  };
};

Renderer.prototype.hr = function () {
  return {
    kind: "block",
    type: "horizontal-rule",
    nodes: [{
      kind: "text",
      ranges: [{
        text: ''
      }]
    }],
    isVoid: true
  };
};

Renderer.prototype.list = function (childNode, isOrdered) {
  var type = isOrdered ? 'numbered-list' : 'bulleted-list';
  return {
    kind: "block",
    type: type,
    nodes: this.groupTextInRanges(childNode)
  };
};

Renderer.prototype.listitem = function (childNode) {
  return {
    kind: "block",
    type: "list-item",
    nodes: this.groupTextInRanges(childNode)
  };
};

Renderer.prototype.paragraph = function (childNode) {
  return {
    kind: "block",
    type: "paragraph",
    nodes: this.groupTextInRanges(childNode)
  };
};

// span level renderer
Renderer.prototype.strong = function (childNode) {
  return childNode.map(function (node) {
    if (node.marks) {
      node.marks.push({ type: "bold" });
    } else {
      node.marks = [{ type: "bold" }];
    }
    return node;
  });
};

Renderer.prototype.em = function (childNode) {
  return childNode.map(function (node) {
    if (node.marks) {
      node.marks.push({ type: "italic" });
    } else {
      node.marks = [{ type: "italic" }];
    }
    return node;
  });
};

Renderer.prototype.codespan = function (text) {
  return new TextNode(text, { "type": "code" });
};

Renderer.prototype.br = function () {
  return {
    text: '--'
  };
};

Renderer.prototype.del = function (childNode) {
  return childNode.map(function (node) {
    if (node.marks) {
      node.marks.push({ type: "deleted" });
    } else {
      node.marks = [{ type: "deleted" }];
    }
    return node;
  });
};

Renderer.prototype.ins = function (childNode) {
  return childNode.map(function (node) {
    if (node.marks) {
      node.marks.push({ type: "inserted" });
    } else {
      node.marks = [{ type: "inserted" }];
    }
    return node;
  });
};

Renderer.prototype.link = function (href, title, childNode) {
  var data = {
    href: href
  };
  if (title) {
    data.title = title;
  }
  return {
    kind: "inline",
    type: "link",
    nodes: this.groupTextInRanges(childNode),
    data: data
  };
};

Renderer.prototype.image = function (href, title, alt) {
  var data = {
    src: href
  };

  if (title) {
    data.title = title;
  }
  if (alt) {
    data.alt = alt;
  }

  return {
    kind: "block",
    type: "image",
    nodes: [{
      kind: "text",
      ranges: [{
        text: ""
      }]
    }],
    isVoid: true,
    data: data
  };
};

Renderer.prototype.text = function (childNode) {
  return new TextNode(childNode);
};

// Auxiliary object constructors:
function TextNode(text, marks) {
  this.text = text;
  if (marks) {
    this.marks = [marks];
  }
}

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = assign({}, options || defaults);
  this.options.renderer = this.options.renderer || new Renderer();
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function (src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function (src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.slice().reverse();

  var out = [];
  while (this.next()) {
    out.push(this.tok());
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function () {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function () {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function () {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.parse(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function () {
  switch (this.token.type) {
    case 'space':
      {
        return {
          "kind": "text",
          "ranges": [{
            "text": ""
          }]
        };
      }
    case 'hr':
      {
        return this.renderer.hr();
      }
    case 'heading':
      {
        return this.renderer.heading(this.inline.parse(this.token.text), this.token.depth);
      }
    case 'code':
      {
        return this.renderer.code(this.token.text, this.token.lang);
      }
    case 'blockquote_start':
      {
        var body = [];

        while (this.next().type !== 'blockquote_end') {
          body.push(this.inline.parse(this.token.text));
        }
        return this.renderer.blockquote(body);
      }
    case 'list_start':
      {
        var _body = [];
        var ordered = this.token.ordered;

        while (this.next().type !== 'list_end') {
          _body.push(this.tok());
        }

        return this.renderer.list(_body, ordered);
      }
    case 'list_item_start':
      {
        var _body2 = [];

        while (this.next().type !== 'list_item_end') {
          _body2.push(this.token.type === 'text' ? this.parseText() : this.tok());
        }

        return this.renderer.listitem(_body2);
      }
    case 'loose_item_start':
      {
        var _body3 = [];

        while (this.next().type !== 'list_item_end') {
          _body3.push(this.tok());
        }

        return this.renderer.listitem(_body3);
      }
    case 'paragraph':
      {
        return this.renderer.paragraph(this.inline.parse(this.token.text));
      }
    case 'text':
      {
        return this.renderer.text(this.parseText());
      }
  }
};

/**
 * Helpers
 */

function replace(regex, options) {
  regex = regex.source;
  options = options || '';
  return function self(name, val) {
    if (!name) {
      return new RegExp(regex, options);
    }
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

var MarkdownParser = {
  parse: function parse(src, options) {
    options = assign({}, defaults, options);
    try {
      var fragment = Parser.parse(Lexer.parse(src, options), options);
    } catch (e) {
      if (options.silent) {
        fragment = [{
          kind: "block",
          type: "paragraph",
          nodes: [{
            kind: "text",
            ranges: [{
              text: "An error occured:"
            }, {
              text: e.message
            }]
          }]
        }];
      } else {
        throw e;
      }
    }
    var mainNode = { nodes: fragment };
    return mainNode;
  }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * String.
 */

var String = new Record({
  kind: 'string',
  text: ''
});

/**
 * Rules to (de)serialize nodes.
 *
 * @type {Object}
 */

var RULES = [{
  serialize: function serialize(obj, children) {
    if (obj.kind == 'string') {
      return children;
    }
  }
}, {
  serialize: function serialize(obj, children) {
    if (obj.kind != 'block') return;

    switch (obj.type) {
      case 'paragraph':
        return '\n' + children + '\n';
      case 'block-quote':
        return '> ' + children + '\n';
      case 'bulleted-list':
        return children;
      case 'list-item':
        return '* ' + children + '\n';
      case 'heading1':
        return '# ' + children;
      case 'heading2':
        return '## ' + children;
      case 'heading3':
        return '### ' + children;
      case 'heading4':
        return '#### ' + children;
      case 'heading5':
        return '##### ' + children;
      case 'heading6':
        return '###### ' + children;
      case 'heading6':
        return '###### ' + children;
      case 'horizontal-rule':
        return '---';
      case 'image':
        var title = obj.getIn(['data', 'title']);
        var src = obj.getIn(['data', 'src']);
        var alt = obj.getIn(['data', 'alt']);
        return '![' + title + '](' + src + ' "' + alt + '")';
    }
  }
}, {
  serialize: function serialize(obj, children) {
    if (obj.kind != 'inline') return;

    switch (obj.type) {
      case 'link':
        return '[' + obj.getIn(['data', 'href']) + '](' + children + ')';
    }
  }
},
// Add a new rule that handles marks...
{
  serialize: function serialize(obj, children) {
    if (obj.kind != 'mark') return;
    switch (obj.type) {
      case 'bold':
        return '**' + children + '**';
      case 'italic':
        return '*' + children + '*';
      case 'code':
        return '`' + children + '`';
      case 'inserted':
        return '__' + children + '__';
      case 'deleted':
        return '~~' + children + '~~';

    }
  }
}];

/**
 * Markdown serializer.
 *
 * @type {Markdown}
 */

var Markdown = function () {

  /**
   * Create a new serializer with `rules`.
   *
   * @param {Object} options
   *   @property {Array} rules
   * @return {Markdown} serializer
   */

  function Markdown() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    classCallCheck(this, Markdown);

    this.rules = [].concat(toConsumableArray(options.rules || []), RULES);

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

  createClass(Markdown, [{
    key: 'serialize',
    value: function serialize(state) {
      var document = state.document;

      var elements = document.nodes.map(this.serializeNode);

      return elements.join('\n').trim();
    }

    /**
     * Serialize a `node`.
     *
     * @param {Node} node
     * @return {String}
     */

  }, {
    key: 'serializeNode',
    value: function serializeNode(node) {
      if (node.kind == 'text') {
        var ranges = node.getRanges();
        return ranges.map(this.serializeRange);
      }

      var children = node.nodes.map(this.serializeNode);
      children = children.flatten().length === 0 ? '' : children.flatten().join('');

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var rule = _step.value;

          if (!rule.serialize) continue;
          var ret = rule.serialize(node, children);
          if (ret) return ret;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Serialize a `range`.
     *
     * @param {Range} range
     * @return {String}
     */

  }, {
    key: 'serializeRange',
    value: function serializeRange(range) {
      var _this = this;

      var string = new String({ text: range.text });
      var text = this.serializeString(string);

      return range.marks.reduce(function (children, mark) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _this.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var rule = _step2.value;

            if (!rule.serialize) continue;
            var ret = rule.serialize(mark, children);
            if (ret) return ret;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }, text);
    }

    /**
     * Serialize a `string`.
     *
     * @param {String} string
     * @return {String}
     */

  }, {
    key: 'serializeString',
    value: function serializeString(string) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.rules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var rule = _step3.value;

          if (!rule.serialize) continue;
          var ret = rule.serialize(string, string.text);
          if (ret) return ret;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }

    /**
     * Deserialize a markdown `string`.
     *
     * @param {String} markdown
     * @return {State} state
     */

  }, {
    key: 'deserialize',
    value: function deserialize(markdown) {
      var nodes = MarkdownParser.parse(markdown);
      var state = Raw.deserialize(nodes);
      return state;
    }
  }]);
  return Markdown;
}();

export default Markdown;