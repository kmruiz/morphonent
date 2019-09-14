/**
 * Copyright 2019 Kevin Mas Ruiz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { attach } from './bus'

function refreshIso (registry, element) {
  if (element.getAttribute('data-morphonent-id')) {
    const id = element.getAttribute('data-morphonent-id')
    registry.set(id, element)
    element._pathId = id
    element.removeAttribute('data-morphonent-id')

    for (let i = 0; i < element.children.length; i++) {
      refreshIso(registry, element.children[i])
    }

    if (element.children.length === 0) {
      element.innerHTML = ''
    }
  }
}

function renderOn (selector, component) {
  render(document.querySelector(selector), component)
}

function render (root, component) {
  root.registry = root.registry || new Map()
  root.registry.set('R', root)

  refreshIso(root.registry, root)
  resolveAndApply(root, root.registry, root, component, 'R/0')
}

function resolveAndApply (root, registry, parent, component, id) {
  const result = resolveComponentToElement(component)

  if (result.then) {
    result.then(cmp => resolveAndApply(root, registry, parent, cmp, id))
  } else {
    applyToDOM(root, registry, parent, result, id)
  }
}

function resolveComponentToElement (component) {
  if (typeof component === 'function') {
    return component()
  } else {
    return component
  }
}

function applyToDOM (root, registry, parent, component, id) {
  if (Array.isArray(component)) {
    return component.forEach((child, index) => resolveAndApply(root, registry, parent, child, `${id}/${index}`))
  }

  let element = registry.get(id)

  if (typeof component !== 'object' && typeof component !== 'function') {
    const text = document.createTextNode(component)
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
    parent.appendChild(text)
    return registry.set(id, text)
  }

  if (component.from && component.to) {
    applyToDOM(root, registry, parent, resolveComponentToElement(component.from), id)
    return resolveAndApply(root, registry, parent, component.to, id)
  }

  if (component.events && component.body) {
    component.id = id
    resolveAndApply(root, registry, parent, component.body, id)
    return attach(component, component => render(root, component))
  }

  if (typeof component.name === 'function') {
    return resolveAndApply(root, registry, parent, component.name(component.props, component.children), id)
  }

  if (element && element.nodeName.toLowerCase() !== component.name) {
    element.parentNode.removeChild(element)
    element = undefined
  }

  if (element === undefined) {
    element = document.createElement(component.name)
    registry.set(id, element)
    parent.appendChild(element)
    element._pathId = id
  }

  component.props.forEach((value, propName) => {
    if (propName.startsWith('on')) {
      element[propName] = event => {
        if (value.then) {
          return render(root, value.then(v => v(event)))
        }

        render(root, value(event))
      }
    } else if (propName === 'value') {
      element.value = value
    } else {
      element.setAttribute(propName, value)
    }
  })

  if (element.children.length > component.children.length) {
    for (let i = component.children.length; i < element.children.length; i++) {
      const node = element.children[i]
      registry.delete(node._pathId)
      element.removeChild(node)
    }
  }

  resolveAndApply(root, registry, element, component.children, id)
}

export { render, renderOn }
