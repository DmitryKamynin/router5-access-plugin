import createRouter, {PluginFactory, Route} from "router5";
import accessPlugin, { AccessPluginRouter } from "./index";

const path: Route[] = [
  {
  name: 'root',
  path: '/',
  },
  {
    name: 'admin',
    path: '/admin',
    children: [
      {
        name: 'adminPage',
        path: '/page',
      },
    ]
  }
];

const test = () => {
  const router = createRouter(path)
  router.usePlugin(accessPlugin({log: true}) as PluginFactory);
  (router as AccessPluginRouter).createPrivateAccess(path[1]);
  (router as AccessPluginRouter).checkAccess(true);

  router.start();

  console.log('plugin test is successful')
}

test();