
// import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare";
// import { RemixServer } from "@remix-run/react";
// import isbot from "isbot";
// import { renderToReadableStream } from "react-dom/server";

// export default async function handleRequest(
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   remixContext: EntryContext,
//   loadContext: AppLoadContext
// ) {
//   const body = await renderToReadableStream(
//     <RemixServer context={remixContext} url={request.url} />,
//     {
//       signal: request.signal,
//       onError(error: unknown) {
//         // Log streaming rendering errors from inside the shell
//         console.error(error);
//         responseStatusCode = 500;
//       },
//     }
//   );

//   if (isbot(request.headers.get("user-agent"))) {
//     await body.allReady;
//   }

//   responseHeaders.set("Content-Type", "text/html");
//   return new Response(body, {
//     headers: responseHeaders,
//     status: responseStatusCode,
//   });
// }

import type {EntryContext} from '@remix-run/server-runtime'
import {RemixServer} from '@remix-run/react'
import {renderToPipeableStream, renderToString} from 'react-dom/server'
import {PassThrough} from 'node:stream'
import isbot from "isbot";

const ABORT_DELAY = 5000

export default async function handleRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext
) {
  return isbot(request.headers.get("user-agent"))
    ? handleBotRequest(
        request,
        statusCode,
        headers,
        context
      )
    : handleBrowserRequest(
        request,
        statusCode,
        headers,
        context
      );
}



function handleBotRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={context} url={request.url} />,
      {
        onAllReady() {
          const passThrough = new PassThrough();
          const body = new ReadableStream({
            start(controller) {
              passThrough.on('data', (chunk) => {
                controller.enqueue(chunk);
              });
              passThrough.on('end', () => {
                controller.close();
              });
              passThrough.on('error', (err) => {
                controller.error(err);
              });
            },
          });
    
          headers.set("Content-Type", "text/html");
    
          resolve(
            new Response(body, {
              status: didError ? 500 : statusCode,
              headers: headers,
            })
          );
    
          pipe(passThrough);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          didError = true;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}


async function handleBrowserRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext
) {
  let isStudioRoute = new URL(request.url).pathname.startsWith(`/studio`)

  // We're only using Styled Components in the /studio route
  // Couldn't find any docs on renderToPipeableStream + Styled Components
    if (isStudioRoute) {
      const sheet = new ServerStyleSheet()
      let markup = renderToString(
        sheet.collectStyles(
          <RemixServer context={remixContext} url={request.url} />
        )
      )
      const styles = sheet.getStyleTags()
      markup = markup.replace('__STYLES__', styles)

      responseHeaders.set('Content-Type', 'text/html')

      return resolve(
        new Response('<!DOCTYPE html>' + markup, {
          status: responseStatusCode,
          headers: responseHeaders,
        })
      )
    }
    
  let markup = renderToString(
      <RemixServer context={context} url={request.url} />
  );

  headers.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: statusCode,
    headers: headers,
  });
}