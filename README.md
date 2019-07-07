# morphonent 
[![Build Status](https://travis-ci.org/kmruiz/morphonent.svg?branch=master)](https://travis-ci.org/kmruiz/morphonent)
[![Coverage Status](https://coveralls.io/repos/github/kmruiz/morphonent/badge.svg?branch=master)](https://coveralls.io/github/kmruiz/morphonent?branch=master) 
![npm](https://img.shields.io/npm/v/morphonent.svg) 
![npm bundle size](https://img.shields.io/bundlephobia/min/morphonent.svg) 
![npm](https://img.shields.io/npm/dm/morphonent.svg)

morphonent is a JavaScript library for building web user interfaces

* **Functional**. Side-effect free and simple, your components will remain reasonable.
* **No special syntax by default**. Uses plain functions, no special syntax.
* **Small**. No runtime dependencies.
* **Async by default**. Designed to load asynchronously components.

## Installation

morphonent is a simple npm package that you can install with yarn:

`$> yarn install morphonent`

or npm:

`$> npm install --save morphonent`

morphonent is bundled as a ES module that is importable from a modern browser or an application compiled
with babel.

## Getting Started

morphonent is a small library that will handle the complexity of rendering from you. There are two ways
of using morphonent: with the standard JavaScript syntax or with JSX (with the support of babel).

If you don't have any transpiler, you can load the module directly from your browser. It's important 
to note however, that only modern browsers support loading ES modules directly.

Create a index.html file in your application root and install morphonent. When you're done, open the
html file that you just created and paste the following content:

```html
<html>
<head>
    <meta charset="UTF-8" />
</head>
<body>
</body>
<script type="module">
    import { renderOn, element } from './node_modules/morphonent/dist/index.js'

    renderOn('body', 'Hello world!')
</script>
</html>
```

This is the most basic usage of morphonent. It will render just a single string in the body of the document. However, we can do better.

Let's create our first component. In morphonent,
components are just functions that return another
component or elements. At this moment, let's parametrize our `Hello world!`:

```js
import { renderOn, element } from './node_modules/morphonent/dist/index.js'

function hello(name) {
    return 'Hello ' + name + "!"; 
}

renderOn('body', hello('Foo'))
```

We've just created our first component! In morphonent there are two types of components:

* Root components. The ones tht are rendered with renderOn (or render) and are tied to a DOM element.
* Subcomponents. Components that are tied to a root component instead of a DOM element.

Let's do something a bit more complex. We want our user to write their name, so we can build more personalized salutations. For this, we will create two subcomponents and a single root component.

```js
import { renderOn, element } from './node_modules/morphonent/dist/index.js'

function name(input, onChange) {
    return element('input', { value: input, onkeyup: (e) => onChange(e.target.value) })
}

function hello(name) {
    return element('div', {}, 'Hello ' + name + "!") 
}

function application(personName) {
    return element('div', {},
        name(personName, application),
        hello(personName)
    )
}

renderOn('body', application(''))
```

Let's explain the code from bit to bit. What we are seeing is how the the whole library works.

```js
function name(input, onChange) {
    return element('input', { value: input, onkeyup: (e) => onChange(e.target.value) })
}
```

This is a component with two parameters. The input value (in this case, the person name), and a event
handler that will be called with there is a change on the input content.

In morphonent, event handlers return a new component (or a function that will create a new component). How 
morphonent handles changes is through transformations: when a component receives an event, the component
will become a new component. We will see more later on.

```js
function hello(name) {
    return element('div', {}, 'Hello ' + name + "!") 
}
```

This is another component, with a single parameter, and will render a div with the 'Hello $name!' message.

```js
function application(personName) {
    return element('div', {},
        name(personName, application),
        hello(personName)
    )
}
```

This is a component that is a composition of the components we've seen earlier. It will print the 
name component and the hello component in a div. Let's take a look a bit deeper on the call to
the name component.

```js
// Component definition
function name(input, onChange) {
    return element('input', { value: input, onkeyup: (e) => onChange(e.target.value) })
}

// Usage
name(personName, application)
```

As you can see, the event handler that we are sending to the **name** component is the application function
itself. What happens under the hood is:

* The **name** component will receive a keyup event.
* The **name** component will call the event handler (onChange) with the current input value.
* The **application** component will be called with the new input value.
* The **application** component will be rendered with the new information.

For example, let's take a look at this simpler application:

```js
import { renderOn, element } from './node_modules/morphonent/dist/index.js'

function hello() {
    return element('button', { onclick: bye }, 'Hello')
}

function bye() {
    return element('button', { onclick: hello }, 'Bye')
}

renderOn('body', hello)
```

The application consists of two components: **hello** and **bye**. Both are implemented as a button that, when
clicked, will become the other component. So for example, if I have a `Hello` button and I click, it 
will become a `Bye` button. Later, if I click the `Bye` button, it will become a `Hello` button, and so on.

### Async Loading of Components

When morphonent finds out that a component is wrapped in a promise, will delay the rendering of the component
until the promise has been fulfilled. This will work in both the root component and subcomponents.

Let's take a look at this sample application, that will load the list of languages used in a project from
Github:

```js
import { renderOn, element } from './node_modules/morphonent/dist/index.js'

function loadLanguages(owner, repository) {
    return fetch('https://api.github.com/repos/' + owner + '/' + repository + '/languages')
        .then(response => response.status === 200 ? response.json() : {})
        .then(langs => Object.keys(langs))
        .catch(ex => []);
}

async function languageList(owner, repository) {
    const languages = await loadLanguages(owner, repository)
    return element('ul', {},
        languages.map(lang => element('li', {}, lang))
    )
}

function repositoryInformation(owner, repository, onNewRepositoryInfo) {
    return element('div', {},
        element('div', {}, 
            element('input', { 
                type: 'text', 
                value: owner, 
                onchange: (e) => onNewRepositoryInfo(e.target.value, repository)
            }),
        ),
        element('div', {}, 
            element('input', { 
                type: 'text', 
                value: repository, 
                onchange: (e) => onNewRepositoryInfo(owner, e.target.value)
            }),
        ),
    )
}

async function application(owner, repository) {
    return [ 
        repositoryInformation(owner, repository, application ), 
        await languageList(owner, repository)
    ]
}

renderOn('body', application("kmruiz", "morphonent"))
```

Loading the language list is asynchronous (it's an AJAX request), but the inputs are synchronous. Loading
the language information won't block the rendering of other components.

## Using JSX

To use JSX, you will need [babel](https://babeljs.io/) and [babel-plugin-transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx). You will need to add the following configuration
to your .babelrc:

```js
{
  "plugins": [
      //...
    ["@babel/plugin-transform-react-jsx", {
      "pragma": "element",
      "pragmaFrag": "element",
      "throwIfNamespace": false
    }]
  ]
}
```

And you will be able to use JSX in your application! However, there are some limitations:

* JSX only works for HTML elements. You can't use JSX syntax for composing your own components (yet).

For example, this doesn't work:

```jsx
<div>
    <MyComponent size="XS" />
</div>
```

You will need to do it with the normal function call syntax:

```jsx
<div>{MyComponent({size: "XS"})}</div>
```