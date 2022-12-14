import { inject, InjectionKey, ref, Ref } from 'vue';

export interface AppState {
  // routerKey is used to force a component rerender, useful when we want to refresh a component when clicking on the same link of the current route (i.e. from the sidebar)
  routerKey: Ref<number>;
  globalError: Ref<unknown | undefined>;

  updateRouterKey(): void;
  setGlobalError(e?: unknown): void;
}

export function newAppState(): AppState {
  const routerKey = ref(0);
  const globalError: Ref<unknown | undefined> = ref();

  const updateRouterKey = () => {
    setGlobalError();
    routerKey.value++;
  };

  const setGlobalError = (e?: unknown) => {
    globalError.value = e;
  };

  return {
    routerKey,
    globalError,

    updateRouterKey,
    setGlobalError,
  };
}

export const AppStateInjectionKey: InjectionKey<AppState> = Symbol();

export function useAppState(): AppState {
  const appState = inject(AppStateInjectionKey);
  if (!appState) {
    throw new Error('could not get appState');
  }

  return appState;
}
