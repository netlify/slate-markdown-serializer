import MarkdownRenderer from "../renderer";
const Markdown = new MarkdownRenderer();

// By parsing, rendering and reparsing we can test both sides of the serializer
// at the same time and ensure that parsing / rendering is compatible.
function getNodes(text) {
  const parsed = Markdown.deserialize(text);
  return parsed.document.nodes;

  const rendered = Markdown.serialize(parsed);
  const reparsed = Markdown.deserialize(rendered);
  return reparsed.document.nodes;
}

test("parses paragraph", () => {
  const output = Markdown.deserialize("This is just a sentance");
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading1", () => {
  const output = Markdown.deserialize("# Heading");
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading2", () => {
  const output = Markdown.deserialize("## Heading");
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading3", () => {
  const output = Markdown.deserialize("### Heading");
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading4", () => {
  const output = Markdown.deserialize("#### Heading");
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading5", () => {
  const output = Markdown.deserialize("##### Heading");
  expect(output.document.nodes).toMatchSnapshot();
});

test("parses heading6", () => {
  const output = Markdown.deserialize("###### Heading");
  expect(output.document.nodes).toMatchSnapshot();
});

test("bold mark", () => {
  const text = `**this is bold**`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("italic mark", () => {
  const text = `*this is italic* _this is italic too_`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("deleted mark", () => {
  const text = `~~this is strikethrough~~`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("inserted mark", () => {
  const text = `++inserted text++`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("code mark", () => {
  const text = "`const foo = 123;`";
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses quote", () => {
  const text = `
> this is a quote
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses list items", () => {
  const text = `
- one
- two
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses list with trailing item", () => {
  const text = `
- one
- two
-
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses indented list items", () => {
  const text = `
 - one
 - two
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses list items with marks", () => {
  const text = `
 - one **bold**
 - *italic* two
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses ordered list items", () => {
  const text = `
1. one
1. two
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses ordered list with trailing item", () => {
  const text = `
1. one
1. two
1.
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses ordered list items with marks", () => {
  const text = `
1. one **bold**
1. *italic* two
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses ordered list items with different numbers", () => {
  const text = `
1. one
2. two
3. three
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses mixed list items", () => {
  const text = `
1. list

- another

1. different
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses tables", () => {
  const text = `
| Tables   |      Are      |  Cool |
|----------|:-------------:|------:|
| col 1 is |  left-aligned | $1600 |
| col 2 is |    centered   |   $12 |
| col 3 is | right-aligned |    $1 |
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses todo list items", () => {
  const text = `
[ ] todo
[x] done
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses nested todo list items", () => {
  const text = `
[ ] todo
   [ ] nested
   [ ] deep
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses double nested todo list items", () => {
  const text = `
[x] checked
   [ ] empty
   [x] checked

[ ] three
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses todo list items with marks", () => {
  const text = `
 [x] ~~done~~
 [x] more **done**
`;
  expect(getNodes(text)).toMatchSnapshot();
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
  expect(getNodes(text)).toMatchSnapshot();
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
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses indented code blocks", () => {
  const text = `
    const hello = 'world';
    function() {
      return hello;
    }
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses link", () => {
  const text = `[google](http://google.com)`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses link within mark", () => {
  const text = `**[google](http://google.com)**`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses link with encoded characters", () => {
  const text = `[kibana](https://example.com/app/kibana#/discover?_g=%28refreshInterval:%28%27$$hashKey%27:%27object:1596%27,display:%2710%20seconds%27,pause:!f,section:1,value:10000%29,time:%28from:now-15m,mode:quick,to:now%29%29&_a=%28columns:!%28metadata.step,message,metadata.attempt_f,metadata.tries_f,metadata.error_class,metadata.url%29,index:%27logs-%27,interval:auto,query:%28query_string:%28analyze_wildcard:!t,query:%27metadata.at:%20Stepper*%27%29%29,sort:!%28time,desc%29%29)`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses link with percent symbol", () => {
  const text = `[kibana](https://example.com/app/kibana#/visualize/edit/Requests-%)`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses interesting nesting", () => {
  const text = `
* List item that contains a blockquote with inline mark

  > Blockquote with code \`mapStateToProps()\`
`;
  expect(getNodes(text)).toMatchSnapshot();
});

test("parses empty string", () => {
  expect(getNodes("")).toMatchSnapshot();
});

test("parses whitespace string", () => {
  expect(getNodes("   ")).toMatchSnapshot();
});
