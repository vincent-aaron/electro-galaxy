import "server-only";
import { NextResponse } from "next/server";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type JsonResult =
  | { data: Record<string, unknown>; response?: undefined }
  | { data?: undefined; response: NextResponse };

const reject = (error: string, status: number): JsonResult => ({
  response: NextResponse.json({ success: false, error }, { status }),
});

/**
 * Reads a JSON object from the request, stopping as soon as the body is larger
 * than `maxBytes`. The Content-Length header is not trusted on its own because
 * a client can omit it or lie about it.
 */
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonResult> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return reject("Request is too large.", 413);
  if (!request.body) return reject("Invalid request body.", 400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel();
        return reject("Request is too large.", 413);
      }
      chunks.push(value);
    }

    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return reject("Invalid request body.", 400);
    }
    return { data: parsed as Record<string, unknown> };
  } catch {
    return reject("Invalid request body.", 400);
  }
}
