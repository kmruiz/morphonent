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

describe('transition', () => {
  const NAME = faker.random.uuid()
  const CLASS = faker.random.uuid()
  const FIRST_CHILD = faker.random.uuid()
  const SECOND_CHILD = faker.random.uuid()

  const createdTransition = transition(
    element(NAME, { class: CLASS }, FIRST_CHILD),
    Promise.resolve(element(NAME, {}, SECOND_CHILD))
  )

  it('should contain the source element', () => {
    expect(createdTransition.from.name).toStrictEqual(NAME)
    expect(createdTransition.from.props.get('class')).toStrictEqual(CLASS)
    expect(createdTransition.from.children).toStrictEqual([FIRST_CHILD])
  })

  it('should contain the provided last step', () => {
    expect(createdTransition.to).toBeTruthy()
  })
})
