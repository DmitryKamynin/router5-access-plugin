import {Router, Route, Plugin} from "router5";
import { AccessPluginOptions } from './types/types';


export interface AccessPluginRouter extends Router {
  createPrivateAccess: (...args: Route[]) => void;
  checkAccess:(key: 'loading' | boolean) => void;
}

const accessPlugin = (opt?: AccessPluginOptions) => {
  const defaultOptions: AccessPluginOptions = {
    log: false,
  };
  const options = { ...defaultOptions, ...opt };

  const privateNodes: string[] = [];
  let haveAccess: 'loading' | boolean = 'loading';

  return (router: AccessPluginRouter): Plugin => {

    router.createPrivateAccess = (...args) => {
      const recurse = (name: string, children: Route[]) => {
        children.forEach((item) => {
          privateNodes.push(`${name}.${item.name}`);
          if (item.children?.length) recurse(`${name}.${item.name}`, item.children);
        });
      };

      args.forEach((item) => {
        privateNodes.push(item.name);
        if (item.children?.length) recurse(item.name, item.children);
      });
    };

    router.checkAccess = (key) => {
      if (haveAccess !== key) {
        haveAccess = key;
      }
      if (options.log) {
        console.groupCollapsed('Private access plugin ');
        console.log(`is there access:`, haveAccess);
        console.groupEnd();
      }
      if (haveAccess !== 'loading' && !haveAccess) {
        const state = router.getState();
        if (privateNodes.includes(state.name)) {
          if (options.navigateDefault) router.navigate(options.navigateDefault);
          else router.navigateToDefault();
        }
      }
    };

    router.useMiddleware(() => (toState, fromState) => {
      if (fromState === null) return true;
      if (privateNodes.includes(toState.name)) {
        return (typeof haveAccess === 'boolean' && haveAccess);
      }
      return true;
    });

    return {
      onStop() {
        router.clearMiddleware();
      },
      onStart() {
        if (options.log) {
          console.groupCollapsed('private access plugin started:');
          console.log(
            'router5 private access plugin was started with private nodes: \n',
            privateNodes
          );
          console.groupEnd();
        }
      },
      onTransitionError(toState) {
        if (options.log) {
          console.groupCollapsed('private access plugin rejected:');
          console.log('the transition to state', toState);
          console.groupEnd();
        }
      },
      onTransitionSuccess(toState, fromState) {
        if (options.log && fromState) {
          console.groupCollapsed('private access plugin allowed:');
          console.log('the transition to state', toState);
          console.groupEnd();
        }
      },
    };
  };
};

export default accessPlugin;
