import MarkdownRenderer from "../renderer";
const Markdown = new MarkdownRenderer();

test("parses paragraph", () => {
  const output = Markdown.deserialize("This is just a sentance", {
    terse: true
  });
  expect(output.document.nodes).toMatchSnapshot();
});

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

test("parses list with trailing item", () => {
  const text = `
- one
- two
-
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

test("parses mixed list items", () => {
  const text = `
1. list

- another

1. different
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
  const result = Markdown.serialize(output);
  const output2 = Markdown.deserialize(result, { terse: true });
  expect(output2.document.nodes).toMatchSnapshot();
});

test("parses todo list items", () => {
  const text = `
[ ] todo
[x] done
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses nested todo list items", () => {
  const text = `
[ ] todo
   [ ] nested
   [ ] deep
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses double nested todo list items", () => {
  const text = `
[x] checked
   [ ] empty
   [x] checked

[ ] three
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

test("parses link", () => {
  const text = `[google](http://google.com)`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses link within mark", () => {
  const text = `**[google](http://google.com)**`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses link with encoded characters", () => {
  const text = `[kibana](https://example.com/app/kibana#/discover?_g=%28refreshInterval:%28%27$$hashKey%27:%27object:1596%27,display:%2710%20seconds%27,pause:!f,section:1,value:10000%29,time:%28from:now-15m,mode:quick,to:now%29%29&_a=%28columns:!%28metadata.step,message,metadata.attempt_f,metadata.tries_f,metadata.error_class,metadata.url%29,index:%27logs-%27,interval:auto,query:%28query_string:%28analyze_wildcard:!t,query:%27metadata.at:%20Stepper*%27%29%29,sort:!%28time,desc%29%29)`;
  const output = Markdown.deserialize(text, { terse: true });
  const result = Markdown.serialize(output);
  const output2 = Markdown.deserialize(result, { terse: true });
  expect(output2.document.nodes).toMatchSnapshot();
});

test("parses interesting nesting", () => {
  const text = `
* List item that contains a blockquote with inline mark

  >Blockquote with code \`mapStateToProps()\`
`;
  const output = Markdown.deserialize(text, { terse: true });
  expect(output.document.nodes).toMatchSnapshot();
});
