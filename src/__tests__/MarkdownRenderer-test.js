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

test("parses tables", () => {
  const text = `
| Tables   |      Are      |  Cool |
|----------|:-------------:|------:|
| col 1 is |  left-aligned | $1600 |
| col 2 is |    centered   |   $12 |
| col 3 is | right-aligned |    $1 |
`;

  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses todo list items", () => {
  const text = `
[ ] todo
[x] done
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses todo list items with marks", () => {
  const text = `
 [x] ~~done~~
 [x] more **done**
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses ``` code fences", () => {
  const text = `
\`\`\`
const hello = 'world';
function() {
  return hello;
}
\`\`\`
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses ~~~ code fences", () => {
  const text = `
~~~
const hello = 'world';
function() {
  return hello;
}
~~~
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses indented code blocks", () => {
  const text = `
    const hello = 'world';
    function() {
      return hello;
    }
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});
