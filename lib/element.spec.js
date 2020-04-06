/*
 * Copyright (c) 2020 Kevin Mas Ruiz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import faker from 'faker'
import element from './element'

describe('element', () => {
  const NAME = faker.random.uuid()
  const CLASS = faker.random.uuid()
  const FIRST_CHILD = faker.random.uuid()
  const SECOND_CHILD = faker.random.uuid()

  const createdElement = element(NAME, { class: CLASS }, FIRST_CHILD, SECOND_CHILD)

  it('should contain the provided name', () => {
    expect(createdElement.name).toStrictEqual(NAME)
  })

  it('should contain the provided props', () => {
    expect(createdElement.props.get('class')).toStrictEqual(CLASS)
  })

  it('should contain the provided children', () => {
    expect(createdElement.children).toStrictEqual([FIRST_CHILD, SECOND_CHILD])
  })
})
