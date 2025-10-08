import React from 'react';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

type IParams = {
  enabled?: boolean;
  callback: () => any;
};

let keyboardDismissHandlers: Array<() => any> = [];
export const keyboardDismissHandlerManager = {
  push: (handler: () => any) => {
    keyboardDismissHandlers.push(handler);
    return () => {
      keyboardDismissHandlers = keyboardDismissHandlers.filter(
        (h) => h !== handler
      );
    };
  },
  length: () => keyboardDismissHandlers.length,
  pop: () => {
    return keyboardDismissHandlers.pop();
  },
};

/**
 * Handles attaching callback for Escape key listener on web and Back button listener on Android
 */
export const useKeyboardDismissable = ({ enabled, callback }: IParams) => {
  React.useEffect(() => {
    let cleanupFn = () => {};
    if (enabled) {
      cleanupFn = keyboardDismissHandlerManager.push(callback);
    } else {
      cleanupFn();
    }
    return () => {
      cleanupFn();
    };
  }, [enabled, callback]);

  useBackHandler({ enabled, callback });
};

export function useBackHandler({ enabled, callback }: IParams) {
  useEffect(() => {
    let backHandler = () => {
      callback();
      return true;
    };
    // BackHandler.addEventListener returns a subscription with .remove() in newer RN versions.
    // Older RN exposes BackHandler.removeEventListener. Support both.
    let subscription: { remove?: () => void } | undefined;

    if (enabled) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - some RN types may mark addEventListener differently across versions
        subscription = BackHandler.addEventListener('hardwareBackPress', backHandler);
      } catch (e) {
        subscription = undefined;
      }
    }

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      } else if ((BackHandler as any).removeEventListener) {
        (BackHandler as any).removeEventListener('hardwareBackPress', backHandler);
      }
    };
  }, [enabled, callback]);
}
