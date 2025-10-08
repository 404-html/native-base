import React from 'react';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
let keyboardDismissHandlers = [];
export const keyboardDismissHandlerManager = {
  push: handler => {
    keyboardDismissHandlers.push(handler);
    return () => {
      keyboardDismissHandlers = keyboardDismissHandlers.filter(h => h !== handler);
    };
  },
  length: () => keyboardDismissHandlers.length,
  pop: () => {
    return keyboardDismissHandlers.pop();
  }
};
/**
 * Handles attaching callback for Escape key listener on web and Back button listener on Android
 */

export const useKeyboardDismissable = ({
  enabled,
  callback
}) => {
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
  useBackHandler({
    enabled,
    callback
  });
};
export function useBackHandler({
  enabled,
  callback
}) {
  useEffect(() => {
    let backHandler = () => {
      callback();
      return true;
    };

    // BackHandler.addEventListener returns a subscription in newer RN versions
    // which exposes a `.remove()` method. Older RN versions have BackHandler.removeEventListener.
    let subscription;

    if (enabled) {
      try {
        subscription = BackHandler.addEventListener('hardwareBackPress', backHandler);
      } catch (e) {
        subscription = undefined;
      }
    }

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      } else if (BackHandler.removeEventListener) {
        BackHandler.removeEventListener('hardwareBackPress', backHandler);
      }
    };
  }, [enabled, callback]);
}
//# sourceMappingURL=useKeyboardDismissable.js.map