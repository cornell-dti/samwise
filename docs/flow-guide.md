# Flow Style Guide

Flow is Facebook's static style checker for JavaScript. While this tool enables you to write
idiomatic JavaScript code, you should follow these specific guidelines to ensure a better code
quality.

The rules are listed below with examples and justifications.

Note that this is only a guideline, or a tutorial. You should learn flow on its
[official website](https://flow.org/en/docs/).

## Always Type Annotated React Components

React components can become very complex over time. There may be 
[ten different things](../frontend/src/components/Util/TaskEditors/TaskEditor.jsx) you need to pass
into a component. With type declarations, the users of those component can easily check what needs
to be passed. Also, when it's the time for refactoring, type checker can ensure that you fixed all
the references and usages of the component to be refactored.

## Favor Immutability Over Mutability

Idiomatic react code generally favors the immutable and functional style. Here are some examples: 

- `this.state = [something]` does not work. You have to use `this.setState()`.
- The `render()` function must be a pure function of `this.props` and `this.state`.
- The content redux store should never be mutated manually, but it should be updated by reducers.
- React's pure component only shallowly checks the content, so only immutable data structure works.
- ...

Since JavaScript is a dynamic language, immutability cannot be enforced. Therefore, we must have
tools like Flow or TypeScript to enforce it for us during development.

In Flow, you should write

```javascript
type State = {|
    +name: string;
    +age: number;
|};
```

instead of

```javascript
type State = {|
    name: string;
    age: number;
|};
```

Note that the `+` sign indicates that the field is immutable. You can learn more about the object
type declaration [here](https://flow.org/en/docs/types/objects/). 

Immutable declarations also enabled flow to have better 
[type refinement](https://flow.org/en/docs/lang/refinements/).

Consider the code below:

```javascript
type Person = {|
    +name: string;
    bestFriend: Person | null;
|}

function someOtherFunction(person: Person) {}

function printName(name: string) {}

function test(person: Person) {
    if (person.bestFriend != null) {
        someOtherFunction(person);
        printName(person.bestFriend.name); // Flow yells: person.bestFriend may be null
    }
}
```

Flow thinks that `person.bestFriend` will be `null` even if we checked it above. This behavior is
correct because `someOtherFunction` may set it to `null` again since it's not immutable. If the
field `bestFriend` is declared as immutable.

## Favor Exact Object Type Over Inexact Object Type

Flow supports both exact and inexact object types. However, exact object types generally ensure
better and cleaner code and the Flow team planned to 
[have exact object type by default](https://medium.com/flow-type/on-the-roadmap-exact-objects-by-default-16b72933c5cf)
in the future.

Their difference can be explained in the code below.

```javascript
type ExactPerson = {| +name: string |};
type InexactPerson = { +name: string };
type DeadPerson = { +name: string; +lastWords: string };

function acceptExactPerson(person: ExactPerson) {}
function acceptInexactPerson(person: InexactPerson) {}

function test() {
    acceptExactPerson({ name: 'Alice' }); // Passed Check
    acceptExactPerson({ name: 'Bob', lastWords: 'Ahh' }); // Failed Check. Flow: Extra field lastWords.
    acceptInexactPerson({ name: 'Alice' }); // Passed Check
    acceptInexactPerson({ name: 'Hacked User', intro: 'Ahh' }); // Also passed check, but do you want this?
}
```

You can see that inexact object type allows everything as long as it has all the required fields.
Although it's more flexible, it may cover up some potential problems. For example, you may add
another field `intro` to the type `InexactPerson`, and you want Flow to give you compile error so 
you know where to refactor your code. However, there may be already some places where you do passed
in the field `intro`, but they may mean different things. The type checker cannot find this problem
because it passes both the original test and the current test.

In the context of React component, you generally want your component to do only one thing and do
it in a modular way. Therefore, you really don't want to accidentally pass in extra fields because
some changes elsewhere may break the modular encapsulation in the future in unexpected ways. 
