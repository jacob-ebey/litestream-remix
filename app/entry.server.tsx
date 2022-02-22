import { renderToString } from "react-dom/server";
import { RemixServer } from "remix";
import type { EntryContext, HandleDataRequestFunction } from "remix";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");
  if (request.method.toLowerCase() === "post") {
    responseHeaders.set(
      "fly-replay",
      `region=${process.env.FLY_PRIMARY_REGION}`
    );
  }

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}

export const handleDataRequest: HandleDataRequestFunction = async (
  response: Response,
  { request }
) => {
  if (request.method.toLowerCase() === "post") {
    response.headers.set(
      "fly-replay",
      `region=${process.env.FLY_PRIMARY_REGION}`
    );
  }

  return response;
};
