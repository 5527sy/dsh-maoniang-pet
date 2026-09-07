declare module '@deepseek-ai/cordis' {
  export interface Context {
    effect(factory: () => void | (() => void), label?: string): void
    slots: {
      inject(name: string, factory: () => unknown): void
      register(definition: unknown, component: unknown): () => void
    }
  }
}

declare module '@deepseek-ai/dsh-client-ui-layout/client' {}
declare module '@deepseek-ai/dsh-client-ui-renderer/client' {}