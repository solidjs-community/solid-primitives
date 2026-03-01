// @refresh reload
import { getFontPreloadLinkAttrs } from "@kobalte/solidbase/default-theme/fonts.js";
import { getHtmlProps } from "@kobalte/solidbase/server";
import { StartServer, createHandler } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html {...getHtmlProps()}>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {getFontPreloadLinkAttrs().map((attrs: any) => (
            <link {...attrs} />
          ))}
          <link rel="icon" href="/favicons/favicon.ico" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
