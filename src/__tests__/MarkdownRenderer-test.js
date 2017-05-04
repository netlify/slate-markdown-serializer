import MarkdownRenderer from '../MarkdownRenderer'
const Markdown = new MarkdownRenderer();

test("parses heading1", () => {
  const output = Markdown.deserialize("# Heading", {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading2", () => {
  const output = Markdown.deserialize("## Heading", {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading3", () => {
  const output = Markdown.deserialize("### Heading", {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading4", () => {
  const output = Markdown.deserialize("#### Heading", {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading5", () => {
  const output = Markdown.deserialize("##### Heading", {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading6", () => {
  const output = Markdown.deserialize("###### Heading", {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses quote", () => {
  const text = `
> this is a quote
`
  const output = Markdown.deserialize(text, {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses quote with marks", () => {
  const text = `
> **bold** in a quote
`
  const output = Markdown.deserialize(text, {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses list items", () => {
  const text = `
 - one
 - two
`
  const output = Markdown.deserialize(text, {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses list items with marks", () => {
  const text = `
 - one **bold**
 - *italic* two
`
  const output = Markdown.deserialize(text, {terse: true});
  expect(output.document.nodes).toMatchSnapshot();
});
