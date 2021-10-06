<h4 align="center">
    Router5 access plugin
</h4>

This is a plugin for router5 allows you to set up private access for some pages by calling only 2 methods

### methods
 - **createPrivateAccess**
 - **checkAccess**


**First step  \(router\)**
```javascript
import createRouter from 'router5';
import accessPlugin from "access-plugin-router";

const adminRoute =  { name: 'admin', path: '/admin' };
const moderatorRoute = { name: 'moderator', path: '/moderator' };
const homeRoute = { name: 'home', path: '/' };

const routes = [
  homeRoute,
  adminRoutes,
  moderatorRoutes,
]

const routeInstance = createRouter(routes)

router.usePlugin(accessPlugin());

/// first method
routeInstance.createPrivateAccess(adminRoutes, moderatorRoutes);

routeInstance.start();
```

createPrivateAccess method accepts any number of routes, iterates over their children recursively and marks each path as private

From this moment, router5 will not be able to go to private pages until we call the second plugin method

**Next step  \(state\)**
```javascript
import { routeInstance } from './router';

const state = {
    isHaveAccess: 'loading',
};

const getAccess = async () => {
    const response = await fetch('protectedUrl', {
      headers: {
        Authentication: 'secret'
      }
    });
    state.isHaveAccess = response.ok ? true : false;

   /// second method
   routeInstance.checkAccess(state.isHaveAccess);
};
```
#### if **state.isHaveAccess === true**, then access to private pages will be open, otherwise closed.

### Additional Information

 - **accessPlugin** accepts an object with plugin settings
   - log displays information about the plugin operation to the console
   - navigateDefault allows you to specify the path where the user will be thrown instead of the default of route5 if the user tries to navigate to a private page while checkAccess is false
  ```typescript
     type option = {
        log?: boolean;
        navigateDefault?: string;
     }
     router.usePlugin(accessPlugin(option))
  ```

 - **checkAccess** accepts a boolean value or a 'loading' string
   - if checkAccess contains 'loading', then the plugin will not redirect the user to the default page, but will deny access until a boolean value is received, use this if you want to leave the user the ability to go to private pages immediately from outside
  ```typescript
    type key = boolean | 'loading';
    router.checkAccess(key);
  ```
