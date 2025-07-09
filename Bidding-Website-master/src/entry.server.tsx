import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router-dom/server";
import type { EntryContext } from "react-router-dom/server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  options: RenderToPipeableStreamOptions
) {
  return renderToPipeableStream(
    <ServerRouter context={entryContext} url={request.url} />,
    options
  );
}
