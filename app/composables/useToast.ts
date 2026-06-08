import type { IconNode } from 'lucide'

export type ToastColor = 'neutral' | 'success' | 'info' | 'warning' | 'error'
export type ToastOrientation = 'horizontal' | 'vertical'

export interface ToastAction {
  label: string
  icon?: IconNode
  onClick?: (event: MouseEvent) => void | Promise<void>
}

export interface ToastInput {
  id?: string
  title?: string
  description?: string
  icon?: IconNode
  color?: ToastColor
  duration?: number
  orientation?: ToastOrientation
  actions?: ToastAction[]
  close?: boolean
  progress?: boolean
}

export interface ToastItem extends ToastInput {
  id: string
  createdAt: number
}

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useToast() {
  const toasts = useState<ToastItem[]>('toast:items', () => [])

  function add(input: ToastInput) {
    const toast: ToastItem = {
      color: 'neutral',
      orientation: 'vertical',
      close: true,
      progress: true,
      ...input,
      id: input.id ?? createToastId(),
      createdAt: Date.now(),
    }

    const existingIndex = toasts.value.findIndex(item => item.id === toast.id)
    if (existingIndex >= 0) {
      toasts.value.splice(existingIndex, 1, toast)
    } else {
      toasts.value.push(toast)
    }

    return toast
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  function update(id: string, input: Partial<ToastInput>) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index === -1) return
    toasts.value.splice(index, 1, {
      ...toasts.value[index],
      ...input,
      id,
      createdAt: Date.now(),
    })
  }

  function clear() {
    toasts.value = []
  }

  return {
    toasts,
    add,
    remove,
    update,
    clear,
    success: (input: Omit<ToastInput, 'color'>) => add({ ...input, color: 'success' }),
    info: (input: Omit<ToastInput, 'color'>) => add({ ...input, color: 'info' }),
    warning: (input: Omit<ToastInput, 'color'>) => add({ ...input, color: 'warning' }),
    error: (input: Omit<ToastInput, 'color'>) => add({ ...input, color: 'error' }),
  }
}
