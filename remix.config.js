/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/.*'],
  tailwind: true,
  serverModuleFormat: 'cjs',
  serverBuildPath: "functions/[[path]].js",
  serverConditions: ["workerd", "worker", "browser"],
  serverDependenciesToBundle: "all", 
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverPlatform: "neutral",
}
