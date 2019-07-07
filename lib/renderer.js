/**
 * Copyright 2019 Kevin Mas Ruiz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function render (parent, component, root, id) {
  if (root === undefined) {
    root = parent
    root.registry = root.registry || new Map()
  }

  if (component.then) {
    component.then(e => renderSync(parent, e, root, id || 'R'))
  } else {
    renderSync(parent, component, root, id || 'R')
  }
}

function renderOn (selector, component) {
  render(document.querySelector(selector), component)
}

function reconciliate (parent, result, root, id) {
  let element = root.registry.get(id)
  if (typeof result !== 'object' && typeof result !== 'function') {
    const text = document.createTextNode(result)
    parent.appendChild(text)
    if (element) {
      element.parentNode.removeChild(element)
    }
    root.registry.set(id, text)
    return
  }

  if (result.from && result.to) {
    render(parent, result.from, root, id)
    render(parent, result.to, root, id)
    return
  }

  if (element && element.nodeName.toLowerCase() !== result.name) {
    element.parentNode.removeChild(element)
    element = undefined
  }

  if (element === undefined) {
    element = document.createElement(result.name)
    parent.appendChild(element)
    element._pathId = id
    root.registry.set(id, element)
  }

  result.props.forEach((value, propName) => {
    if (propName.startsWith('on')) {
      element[propName] = event => {
        render(root, value(event), root)
      }
    } else if (propName === 'value') {
      element.value = value
    } else {
      element.setAttribute(propName, value)
    }
  })

  if (element.children.length > result.children.length) {
    for (let i = result.children.length; i < element.children.length; i++) {
      const node = element.children[i]
      root.registry.delete(node._pathId, element)
      element.removeChild(node)
    }
  }

  result.children.forEach((child, index) =>
    render(element, child, root, id + '/' + index)
  )
}

function renderSync (parent, component, root, id) {
  let result
  if (typeof component === 'function') {
    result = component()
  } else {
    result = component
  }

  if (Array.isArray(result)) {
    result.forEach((e, index) =>
      reconciliate(parent, e, root, id + '/' + index)
    )
    return
  }

  reconciliate(parent, result, root, id + '/U')
}

export { render, renderOn }
