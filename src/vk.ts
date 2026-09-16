import bridge, { type UserInfo } from '@vkontakte/vk-bridge'

let initPromise: Promise<boolean> | null = null

export type VkUser = UserInfo

export function isVkEnvironment() {
  if (typeof window === 'undefined') return false
  if (bridge.isEmbedded() || bridge.isWebView()) return true
  const params = new URLSearchParams(window.location.search)
  return params.has('vk_user_id') || params.has('vk_app_id')
}

export function initVkBridge() {
  if (!initPromise) {
    initPromise = bridge
      .send('VKWebAppInit')
      .then(() => true)
      .catch(() => false)
  }
  return initPromise
}

export async function getVkUser(): Promise<VkUser | null> {
  try {
    await initVkBridge()
    return await bridge.send('VKWebAppGetUserInfo')
  } catch {
    return null
  }
}

export async function getVkAppearance(): Promise<'light' | 'dark' | null> {
  try {
    const config = await bridge.send('VKWebAppGetConfig')
    const appearance = (config as { appearance?: string }).appearance
    if (appearance === 'dark' || appearance === 'light') return appearance
    return null
  } catch {
    return null
  }
}

export function applyVkInsets(insets?: {
  top?: number
  bottom?: number
  left?: number
  right?: number
}) {
  const root = document.documentElement
  if (!insets) return
  root.style.setProperty('--vk-safe-top', `${insets.top ?? 0}px`)
  root.style.setProperty('--vk-safe-bottom', `${insets.bottom ?? 0}px`)
  root.style.setProperty('--vk-safe-left', `${insets.left ?? 0}px`)
  root.style.setProperty('--vk-safe-right', `${insets.right ?? 0}px`)
}

export function subscribeVkConfig(
  onUpdate: (payload: {
    appearance?: string
    insets?: { top: number; bottom: number; left: number; right: number }
  }) => void,
) {
  const handler = ({
    detail,
  }: {
    detail: { type: string; data: Record<string, unknown> }
  }) => {
    if (detail.type !== 'VKWebAppUpdateConfig') return
    onUpdate(detail.data as {
      appearance?: string
      insets?: { top: number; bottom: number; left: number; right: number }
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bridge.subscribe(handler as any)
  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bridge.unsubscribe(handler as any)
  }
}

export { bridge }
