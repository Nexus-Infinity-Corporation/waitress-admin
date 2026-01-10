# Latest Next.js 16 Hooks Guide

This guide covers the recommended hooks for Next.js 16 (React 19) with practical examples.

## Table of Contents

1. [useActionState](#useactionstate) - Replaces useFormState
2. [useOptimistic](#useoptimistic) - Optimistic UI Updates
3. [useFormStatus](#useformstatus) - Form Submission Status
4. [useTransition](#usetransition) - Non-blocking Updates
5. [useEffectEvent](#useeffectevent) - Effect Event Functions (React 19.2)
6. [ViewTransition](#viewtransition) - View Transitions (React 19.2)

---

## useActionState

**Replaces `useFormState` in Next.js 16**. Manages form/action state with built-in pending state.

### Basic Example

```typescript
'use client'

import { useActionState, startTransition } from 'react'
import { createPost } from '@/app/actions'

export function CreatePostForm() {
  const [state, action, pending] = useActionState(createPost, { message: '' })

  return (
    <form action={(formData) => startTransition(() => action(formData))}>
      <input type="text" name="title" required />
      <button disabled={pending}>
        {pending ? 'Creating...' : 'Create Post'}
      </button>
      {state?.message && <p aria-live="polite">{state.message}</p>}
    </form>
  )
}
```

### With Validation Errors

```typescript
'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions/auth'

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        {state?.errors?.email && (
          <p className="text-red-500">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
        {state?.errors?.password && (
          <ul>
            {state.errors.password.map((error) => (
              <li key={error} className="text-red-500">- {error}</li>
            ))}
          </ul>
        )}
      </div>

      <button disabled={pending} type="submit">
        {pending ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

### Server Action Example

```typescript
// app/actions.ts
"use server";

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get("title") as string;

  if (!title || title.length < 3) {
    return { message: "Title must be at least 3 characters" };
  }

  // Your database logic here
  // await db.posts.create({ title })

  return { message: "Post created successfully!" };
}
```

---

## useOptimistic

Provides immediate UI updates before server confirmation, improving perceived performance.

### Chat/Messaging Example

```typescript
'use client'

import { useOptimistic } from 'react'
import { sendMessage } from './actions'

type Message = {
  id: string
  text: string
  timestamp: Date
}

export function ChatThread({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<
    Message[],
    string
  >(
    messages,
    (state, newMessage) => [
      ...state,
      {
        id: `temp-${Date.now()}`,
        text: newMessage,
        timestamp: new Date(),
      },
    ]
  )

  const formAction = async (formData: FormData) => {
    const message = formData.get('message') as string
    addOptimisticMessage(message) // Immediate UI update
    await sendMessage(message) // Server action
  }

  return (
    <div>
      <div className="messages">
        {optimisticMessages.map((msg) => (
          <div key={msg.id} className="message">
            <p>{msg.text}</p>
            <span className="timestamp">
              {msg.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      <form action={formAction}>
        <input type="text" name="message" placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
```

### Todo List with Optimistic Updates

```typescript
'use client'

import { useOptimistic } from 'react'
import { toggleTodo } from './actions'

type Todo = {
  id: string
  text: string
  completed: boolean
}

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, updateOptimisticTodo] = useOptimistic<
    Todo[],
    { id: string; completed: boolean }
  >(
    todos,
    (state, { id, completed }) =>
      state.map((todo) =>
        todo.id === id ? { ...todo, completed } : todo
      )
  )

  const handleToggle = async (id: string, completed: boolean) => {
    updateOptimisticTodo({ id, completed: !completed })
    await toggleTodo(id, !completed)
  }

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo.id, todo.completed)}
          />
          <span className={todo.completed ? 'line-through' : ''}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  )
}
```

---

## useFormStatus

Provides form submission status. **Enhanced in React 19** with additional properties (`data`, `method`, `action`).

### Basic Example

```typescript
'use client'

import { useFormStatus } from 'react-dom'
import { createTodo } from '@/app/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  )
}

export function AddTodoForm() {
  return (
    <form action={createTodo}>
      <input type="text" name="todo" placeholder="Enter task..." required />
      <SubmitButton />
    </form>
  )
}
```

### React 19 Enhanced Version

```typescript
'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus()

  // React 19 provides: pending, data, method, action
  // Earlier versions: only pending

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

### With Loading Spinner

```typescript
'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2"
    >
      {pending && <Loader2 className="animate-spin" size={16} />}
      {pending ? 'Processing...' : 'Submit'}
    </button>
  )
}
```

---

## useTransition

Marks state updates as non-blocking transitions, keeping the UI responsive.

### Basic Example

```typescript
'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from './actions'

export function ProfileForm() {
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await updateProfile(name)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />
      <button disabled={isPending} type="submit">
        {isPending ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  )
}
```

### With Server Actions

```typescript
'use client'

import { useState, useEffect, useTransition } from 'react'
import { incrementViews } from './actions'

export default function ViewCount({ initialViews }: { initialViews: number }) {
  const [views, setViews] = useState(initialViews)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const updatedViews = await incrementViews()
      setViews(updatedViews)
    })
  }, [])

  return (
    <div>
      <p>Total Views: {views}</p>
      {isPending && <span className="text-gray-500">Updating...</span>}
    </div>
  )
}
```

### Error Handling

```typescript
'use client'

import { useTransition } from 'react'

export function ActionButton() {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(() => {
      // Errors here will propagate to nearest error boundary
      throw new Error('Something went wrong')
    })
  }

  return (
    <button onClick={handleClick} disabled={pending}>
      {pending ? 'Processing...' : 'Click me'}
    </button>
  )
}
```

---

## useEffectEvent

**React 19.2+**: Extracts non-reactive logic from Effects into reusable Effect Event functions.

### Example: Analytics Tracking

```typescript
'use client'

import { useEffect, useEffectEvent, useState } from 'react'

export function ProductView({ productId }: { productId: string }) {
  const [viewCount, setViewCount] = useState(0)

  // Extract non-reactive logic
  const trackView = useEffectEvent((id: string) => {
    // This function doesn't need to be in the dependency array
    console.log('Tracking view for product:', id)
    // Analytics tracking logic here
  })

  useEffect(() => {
    trackView(productId)
    setViewCount((prev) => prev + 1)
  }, [productId]) // Only productId in dependencies

  return <div>Product {productId} - Views: {viewCount}</div>
}
```

### Example: Event Handler with Effect

```typescript
'use client'

import { useEffect, useEffectEvent, useRef } from 'react'

export function ScrollTracker() {
  const scrollPosition = useRef(0)

  const handleScroll = useEffectEvent((position: number) => {
    // Non-reactive logic that doesn't need to re-run
    scrollPosition.current = position
    // Save to localStorage or send analytics
    localStorage.setItem('scrollPosition', position.toString())
  })

  useEffect(() => {
    const onScroll = () => {
      handleScroll(window.scrollY)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, []) // Empty deps - handleScroll is stable

  return <div>Scroll position tracked</div>
}
```

---

## ViewTransition

**React 19.2+**: Enables smooth view transitions for animated page/component updates.

### Setup

First, enable in `next.config.ts`:

```typescript
const nextConfig = {
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
```

### Basic Usage

```typescript
'use client'

import { ViewTransition } from 'react'
import { useState } from 'react'

export function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState(0)
  const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']

  return (
    <ViewTransition>
      <div className="gallery">
        <img
          src={images[selectedImage]}
          alt={`Image ${selectedImage + 1}`}
          style={{ viewTransitionName: 'main-image' }}
        />
        <div className="thumbnails">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              onClick={() => setSelectedImage(idx)}
              style={{ viewTransitionName: `thumbnail-${idx}` }}
            />
          ))}
        </div>
      </div>
    </ViewTransition>
  )
}
```

### With CSS Animations

```css
/* globals.css */
@view-transition {
  navigation: auto;
}

::view-transition-old(main-image),
::view-transition-new(main-image) {
  animation-duration: 0.3s;
  animation-timing-function: ease-in-out;
}
```

---

## Migration Notes

### From useFormState to useActionState

**Before (Next.js 14):**

```typescript
import { useFormState } from "react-dom";

const [state, formAction] = useFormState(createPost, initialState);
```

**After (Next.js 16):**

```typescript
import { useActionState } from "react";

const [state, action, pending] = useActionState(createPost, initialState);
```

### Key Differences:

- `useActionState` is from `'react'` (not `'react-dom'`)
- Returns `pending` state directly (no need for `useFormStatus` in simple cases)
- Better TypeScript support
- Works with `startTransition` for better performance

---

## Best Practices

1. **Use `useActionState` for forms** - It's the modern replacement for `useFormState`
2. **Use `useOptimistic` for instant feedback** - Great for likes, comments, messages
3. **Combine hooks** - Use `useFormStatus` inside forms that use `useActionState` for nested components
4. **Use `useTransition` for heavy updates** - Keeps UI responsive during state changes
5. **Leverage React 19.2 features** - `useEffectEvent` and `ViewTransition` for advanced use cases

---

## Summary

| Hook             | Purpose                        | React Version | Import From |
| ---------------- | ------------------------------ | ------------- | ----------- |
| `useActionState` | Form/action state with pending | 19+           | `react`     |
| `useOptimistic`  | Optimistic UI updates          | 19+           | `react`     |
| `useFormStatus`  | Form submission status         | 19+           | `react-dom` |
| `useTransition`  | Non-blocking updates           | 18+           | `react`     |
| `useEffectEvent` | Extract effect logic           | 19.2+         | `react`     |
| `ViewTransition` | View transitions               | 19.2+         | `react`     |
