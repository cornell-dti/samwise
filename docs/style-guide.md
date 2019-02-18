# Style Guide

## General Rules

The repo has already been setup with some linter config and style guides. They should be 
automatically installed when you are installing the dependencies.

You should configure your IDE so that it will warn you when it's violated. You should not ignore
those linter warnings. You are expected to follow the guides given by the linters and only commit 
code that passes the linter checks.

When you have doubts about why certain linting rules exist, you should first search online to
understand it's rationale. If you are unsure about how to make the linter happy, please ask another
team member.

However, sometimes you may need to suppress some linter checks. In those circumstances, you should
document the reason why you must suppress these checks. It should only be occasionally used.

## Backend

Always follow the [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guide.

IDE Integration:

- PyCharm: PEP 8 linting enabled by default.
- VSCode: [link](https://code.visualstudio.com/docs/python/linting)
- Atom: [link](https://atom.io/packages/pep8)

## Frontend

### ESLint

Always follow the [airbnb JavaScript style guide](https://github.com/airbnb/javascript). We already
have the [ESLint](https://eslint.org) [config](../.eslintrc) setup in the repo.

ESLint IDE Integration:

- JetBrains family: [IntelliJ](https://www.jetbrains.com/help/idea/eslint.html),
  [WebStorm](https://www.jetbrains.com/help/webstorm/eslint.html)
- VSCode: [link](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- Atom: [link](https://atom.io/packages/linter-eslint)
- Others: [ESLint Integration Page](https://eslint.org/docs/user-guide/integrations)

### Flow

Besides ESLint, we also use [Flow](https://flow.org) to statically type-check our frontend code. 
Since JavaScript is a dynamic language with many 
[surprises](https://charlieharvey.org.uk/page/javascript_the_weird_parts) and our frontend code is
inherently complex, this is a must. You are expected to add type annotations to your React
components and pass the Flow static type checker. Here is [our Flow guideline](flow-guide.md) for 
you to follow.

Flow should be automatically installed in `node_modules/` when you are installing frontend
dependencies. You can follow the instructions on [Flow's website](https://flow.org/en/docs/install/)
if you encountered any problems. The config of the flow is listed [here](../.flowconfig).

To run flow locally to type-check your code, you can run `yarn run flow` or `flow` if you have
installed flow globally. Flow can provide reliable type-based auto-completion service for your IDEs,
so you should properly configure it.

Flow IDE Integration:

- JetBrains family: [IntelliJ](https://www.jetbrains.com/help/idea/using-the-flow-type-checker.html),
  [WebStorm](https://www.jetbrains.com/help/webstorm/using-the-flow-type-checker.html)
- VSCode: [Flow Language Support](https://marketplace.visualstudio.com/items?itemName=flowtype.flow-for-vscode) 
  or [vscode-flow-ide](https://marketplace.visualstudio.com/items?itemName=gcazaciuc.vscode-flow-ide)
- Atom: [Flow for Atom IDE](https://atom.io/packages/ide-flowtype)
- Others: [Flow Editors Page](https://flow.org/en/docs/editors/)

Flow also provides some community-maintained library definitions. You should install them so that
you can have better auto-completion when using those dependencies. 

You should install the [flow-typed](https://github.com/flow-typed/flow-typed) tool globally to
manage all the type declaration we will use. When we update the version of certain dependencies,
you should run `flow-typed` again.

## Documentation

You should document all your code. 

For each backend endpoints, the behavior and the interface should be documented on our 
[Apiary page](https://samwise.docs.apiary.io/).

For each frontend components and functions, you should give sufficient information to enable the
user of the component/function to completely understand what needs to be passed in. If the type
signature and the component/function name is always obvious what's going on, you **don't** need to
repeat it in the docs.
