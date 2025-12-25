import { useSyncExternalStore } from "react";

export function createStateStore<T>(initialValue: T) {
    let state: T = initialValue;
    const subscribers = new Set<() => void>();

    function notify() {
        subscribers.forEach((subscriber) => subscriber());
    }

    function setState(newState: T) {
        const prevState = state;
        state = newState;
        // Only notify if state actually changed (reference check)
        if (prevState !== newState) {
            notify();
        }
    }

    function useStore(): T {
        return useSyncExternalStore(
            (onChange) => {
                subscribers.add(onChange);
                return () => {
                    subscribers.delete(onChange);
                };
            },
            () => state,
            () => state
        );
    }

    return {
        getState: () => state,
        setState,
        useStore,
    };
}