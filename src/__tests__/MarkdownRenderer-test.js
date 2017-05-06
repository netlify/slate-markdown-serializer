import MarkdownRenderer from "../MarkdownRenderer";
const Markdown = new MarkdownRenderer();

test("parses heading1", () => {
  const output = Markdown.deserialize("# Heading", { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading2", () => {
  const output = Markdown.deserialize("## Heading", { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading3", () => {
  const output = Markdown.deserialize("### Heading", { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading4", () => {
  const output = Markdown.deserialize("#### Heading", { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading5", () => {
  const output = Markdown.deserialize("##### Heading", { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading6", () => {
  const output = Markdown.deserialize("###### Heading", { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses quote", () => {
  const text = `
> this is a quote
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses quote with marks", () => {
  const text = `
> **bold** in a quote
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses list items", () => {
  const text = `
- one
- two
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses indented list items", () => {
  const text = `
 - one
 - two
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses list items with marks", () => {
  const text = `
 - one **bold**
 - *italic* two
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses ordered list items", () => {
  const text = `
1. one
1. two
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses ordered list items with marks", () => {
  const text = `
1. one **bold**
1. *italic* two
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses ordered list items with different numbers", () => {
  const text = `
1. one
2. two
3. three
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});
