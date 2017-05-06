[![CircleCI](https://circleci.com/gh/tommoor/slate-markdown-serializer.svg?style=svg)](https://circleci.com/gh/tommoor/slate-markdown-serializer)

# Slate Markdown Serializer

A Markdown serializer for the [Slate Editor](http://slatejs.org).

## TODO

- [ ] Support serialization of tables > md
- [ ] Support serialization of ordered lists > md
- [ ] Support code fences


## Schema

This module expects your Slate schema to have the following keys (example implementations included):

```javascript
{
  marks: {
    bold: props => <strong>{props.children}</strong>,
    code: props => <code>{props.children}</code>,
    italic: props => <em>{props.children}</em>,
    underlined: props => <u>{props.children}</u>,
    deleted: props => <del>{props.children}</del>,
    added: props => <span>{props.children}</span>,
  },
  nodes: {
    paragraph: props => <p>{props.children}</p>,
    'block-quote': props => <blockquote>{props.children}</blockquote>,
    'horizontal-rule': props => <hr />,
    'bulleted-list': props => <ul>{props.children}</ul>,
    'ordered-list': props => <ol>{props.children}</ol>,
    'list-item': props => <li>{props.children}</li>,
    image: props => <img src={props.src} title={props.title} />,
    link: props => <a href={props.href}>{props.children}</a>,
    table: props => <table>{props.children}</table>,
    'table-row': props => <tr>{props.children}</tr>,
    'table-head': props => <th>{props.children}</th>,
    'table-cell': props => <td>{props.children}</td>,
    heading1: props => <h1>{props.children}</h1>,
    heading2: props => <h2>{props.children}</h2>,
    heading3: props => <h3>{props.children}</h3>,
    heading4: props => <h4>{props.children}</h4>,
    heading5: props => <h5>{props.children}</h5>,
    heading6: props => <h6>{props.children}</h6>,
  }
}
```
