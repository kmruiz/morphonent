/**
 * Copyright 2019 Kevin Mas Ruiz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import faker from 'faker'
import { listeningTo, attach, dispatch } from './bus'

describe('bus', () => {
  const listener = jest.fn()
  const eventName = faker.hacker.noun()
  const body = faker.lorem.text()

  it('should store the subscription information', () => {
    const result = listeningTo({ [eventName]: listener }, body)
    expect(result).toStrictEqual({ events: { [eventName]: listener }, body })
  })

  it('should dispatch to all listeners', () => {
    const result = listeningTo({ [eventName]: listener })
    attach(result, (e) => e)

    expect(dispatch(eventName, body)).toBe(true)
    expect(listener).toHaveBeenCalledWith(new CustomEvent(eventName, { details: body }))
  })
})
