/*
 * Copyright (c) 2020 Kevin Mas Ruiz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import faker from 'faker'
import element from './element'
import transition from './transition'
import { render, renderOn } from './renderer'
import { dispatch, listeningTo } from './bus'
import 'regenerator-runtime'

const waitToRender = (time = 5) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

describe('renderer', () => {
  const TEXT = faker.random.uuid() + ' - OLD'
  const NEW_TEXT = faker.random.uuid() + ' - NEW'

  let container
  let text

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    text = element('span', {}, TEXT)

    render(container, text)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should contain a string body', () => {
    expect(container.textContent).toStrictEqual(TEXT)
  })

  describe('undefined elements', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
      text = () => undefined

      container = document.createElement('div')
      render(container, text)
    })

    it('should not render anything', () => {
      expect(container.innerHTML).toBe('')
    })
  })

  describe('namespaced element', () => {
    beforeEach(() => {
      text = element({ name: 'input', namespace: TEXT }, {})
     
      render(container, text)
    })

    it('should contain the namespace', () => {
      expect(document.querySelector('input').namespaceURI).toStrictEqual(TEXT)
    })
    
    it('should contain the name', () => {
      expect(document.querySelector('input')).toBeTruthy()
    })
  })

  describe('attributes', () => {
    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)

      text = element('input', { value: NEW_TEXT, color: TEXT })

      render(container, text)
    })

    it('should contain a value property', () => {
      expect(container.querySelector('input').value).toStrictEqual(NEW_TEXT)
    })

    it('should contain other properties', () => {
      expect(container.querySelector('input').getAttribute('color')).toStrictEqual(TEXT)
    })
  })

  describe('morphism', () => {
    function lorem () {
      return element('div', {}, NEW_TEXT)
    }

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)

      text = element('span', { onclick: lorem }, TEXT)

      render(container, text)
      container.querySelector('span').click()
    })

    it('should become a new component on event handlers', () => {
      expect(container.textContent).toStrictEqual(NEW_TEXT)
    })
  })

  describe('async components', () => {
    it('should eventually render components wrapped in promises', async () => {
      container = document.createElement('div')
      document.body.appendChild(container)

      text = Promise.resolve(element('span', {}, TEXT))

      render(container, text)
      await text

      expect(container.textContent).toStrictEqual(TEXT)
    })
  })

  describe('function components', () => {
    it('should evaluate them', () => {
      container = document.createElement('div')
      document.body.appendChild(container)

      text = () => element('span', {}, TEXT)

      render(container, text)
      expect(container.textContent).toStrictEqual(TEXT)
    })
  })

  describe('array components', () => {
    it('should evaluate them', () => {
      container = document.createElement('div')
      document.body.appendChild(container)

      text = () => [element('span', {}, TEXT), element('span', {}, NEW_TEXT)]

      render(container, text)
      expect(container.textContent).toContain(TEXT)
      expect(container.textContent).toContain(NEW_TEXT)
    })
  })

  describe('array reconciliation', () => {
    function languages (array) {
      return element('div', { id: 'update', onclick: () => languages(['Java']) }, array.map(lang => element('span', {}, lang)))
    }

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    it('should remove exceeding elements', () => {
      render(container, languages(['JavaScript', 'TypeScript']))
      expect(container.textContent).toContain('JavaScript')
      expect(container.textContent).toContain('TypeScript')

      document.querySelector('#update').click()
      expect(container.textContent).toContain('Java')
      expect(container.textContent).not.toContain('JavaScript')
      expect(container.textContent).not.toContain('TypeScript')
    })
  })

  describe('render by selector', () => {
    beforeEach(() => {
      container = document.createElement('div')
      container.id = 'unique'
      document.body.appendChild(container)

      renderOn('#unique', element('span', {}, TEXT))
    })

    it('should render on the specified selector', () => {
      expect(document.querySelector('#unique').textContent).toStrictEqual(TEXT)
    })
  })

  describe('render transitions', () => {
    let resolvePromise

    const waitToRender = () => {
      return new Promise(resolve => setTimeout(resolve, 0))
    }

    const nextStep = async () => {
      resolvePromise(element('span', {}, NEW_TEXT))
      await waitToRender()
    }

    beforeEach(() => {
      container = document.createElement('div')
      container.id = 'unique'
      document.body.appendChild(container)

      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      const createdTransition = transition(
        element('span', {}, TEXT),
        promise
      )
      renderOn('#unique', createdTransition)
    })

    it('should render first step of the transition', () => {
      expect(document.querySelector('#unique').textContent).toStrictEqual(TEXT)
    })

    it('should render target step of the transition when the promise has been resolved', async () => {
      await nextStep()
      expect(document.querySelector('#unique').textContent).toStrictEqual(NEW_TEXT)
    })
  })

  describe('render transitions on event handlers', () => {
    let resolvePromise

    const waitToRender = () => {
      return new Promise(resolve => setTimeout(resolve, 0))
    }

    const nextStep = async () => {
      resolvePromise(element('span', {}, NEW_TEXT))
      await waitToRender()
    }

    beforeEach(() => {
      container = document.createElement('div')
      container.id = 'unique'
      document.body.appendChild(container)

      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })
      const button = element('button', {
        onclick: Promise.resolve(() => transition(
          element('span', {}, TEXT),
          promise
        ))
      })

      renderOn('#unique', button)
      document.querySelector('button').click()
    })

    it('should render first step of the transition', () => {
      expect(document.querySelector('#unique').textContent).toStrictEqual(TEXT)
    })

    it('should render target step of the transition when the promise has been resolved', async () => {
      await nextStep()
      expect(document.querySelector('#unique').textContent).toStrictEqual(NEW_TEXT)
    })
  })

  describe('bus events', () => {
    describe('synchronous processing', () => {
      beforeEach(() => {
        container = document.createElement('div')
        container.id = 'unique'
        document.body.appendChild(container)

        function myComponent (pinged) {
          return listeningTo({ ping: () => myComponent(true) }, pinged ? NEW_TEXT : TEXT)
        }

        render(container, myComponent(false))
      })

      it('should render the body information', () => {
        expect(document.querySelector('#unique').textContent).toStrictEqual(TEXT)
      })

      it('should render with the new component information when an event has been dispatched', async () => {
        dispatch('ping')
        expect(document.querySelector('#unique').textContent).toStrictEqual(NEW_TEXT)
      })
    })

    describe('asynchronous processing', () => {
      beforeEach(() => {
        container = document.createElement('div')
        container.id = 'unique'
        document.body.appendChild(container)

        function myComponent (pinged) {
          return listeningTo({ ping: () => Promise.resolve(myComponent(true)) }, pinged ? NEW_TEXT : TEXT)
        }

        render(container, myComponent(false))
      })

      it('should render the body information', () => {
        expect(document.querySelector('#unique').textContent).toStrictEqual(TEXT)
      })

      it('should render with the new component information when an event has been dispatched', async () => {
        dispatch('ping')
        await waitToRender()
        expect(document.querySelector('#unique').textContent).toStrictEqual(NEW_TEXT)
      })
    })
  })

  describe('orphan elements', () => {
    it('should rerender an element if it does not exist anymore', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const text = (isNew) => listeningTo({
        reload: () => transition(
          'Basic Text',
          waitToRender(0).then(e => text(true))
        )
      }, element('span', { id: isNew ? 'new_test' : 'test' }, isNew ? NEW_TEXT : TEXT))

      render(container, text(false))
      await waitToRender()

      const spanWithId = document.getElementById('test')
      spanWithId.parentElement.removeChild(spanWithId)

      dispatch('reload')
      await waitToRender()

      const result = document.getElementById('new_test').innerHTML
      expect(result).toEqual(NEW_TEXT)
    })
  })
})
