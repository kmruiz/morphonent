# morphonent 
[![Build Status](https://travis-ci.org/kmruiz/morphonent.svg?branch=master)](https://travis-ci.org/kmruiz/morphonent)
[![Coverage Status](https://coveralls.io/repos/github/kmruiz/morphonent/badge.svg?branch=master)](https://coveralls.io/github/kmruiz/morphonent?branch=master) 
![npm](https://img.shields.io/npm/v/morphonent.svg) 
![npm bundle size](https://img.shields.io/bundlephobia/min/morphonent.svg) 
![npm](https://img.shields.io/npm/dm/morphonent.svg)
![npm](https://img.shields.io/npm/l/morphonent.svg)
![GitHub issues](https://img.shields.io/github/issues/kmruiz/morphonent.svg)
![GitHub pull requests](https://img.shields.io/github/issues-pr/kmruiz/morphonent.svg)

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

You can have a simple morphonent application in few minutes with webpack. You can see how [in the getting
started guide on our wiki](https://github.com/kmruiz/morphonent/wiki/Getting-Started).

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
