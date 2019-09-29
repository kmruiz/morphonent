/*
 * Copyright (c) 2019 Kevin Mas Ruiz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const MORPHONENT_EVENT_TYPE = 'onMorphonentEvent'

export function listeningTo (events, body) {
  return { events, body }
}

const options = { capture: true, passive: true }

function handleMorphonentEvents (event) {
  const eventName = event.detail.name
  const body = event.detail.props

  const listeners = window.addedEventListeners.get(eventName)
  if (listeners) {
    listeners.forEach(handler => handler(body))
  }
}

function registerListenerFor (listenerId, event, handler) {
  if (!window.addedEventListeners) {
    window.addEventListener(MORPHONENT_EVENT_TYPE, event => handleMorphonentEvents(event), options)
    window.addedEventListeners = new Map()
  }

  let currentListener = window.addedEventListeners.get(event)
  if (!currentListener) {
    currentListener = new Map()
    window.addedEventListeners.set(event, currentListener)
  }

  currentListener.set(listenerId, handler)
}

export function attach (listener, decorator) {
  Object.keys(listener.events).forEach(eventName => {
    registerListenerFor(listener.id, eventName, event => decorator(listener.events[eventName](event)))
  })
}

export function dispatch (name, props) {
  const event = new CustomEvent(MORPHONENT_EVENT_TYPE, { detail: { name, props } })
  window.dispatchEvent(event)
  return true
}
