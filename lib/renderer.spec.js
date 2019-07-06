/**
 * Copyright 2019 Kevin Mas Ruiz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import faker from 'faker'
import element from './element'
import { render, renderOn } from './renderer'
import 'regenerator-runtime'

describe('renderer', () => {
  const TEXT = faker.random.uuid()
  const NEW_TEXT = faker.random.uuid()

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

      text = () => [ element('span', {}, TEXT), element('span', {}, NEW_TEXT) ]

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
})
