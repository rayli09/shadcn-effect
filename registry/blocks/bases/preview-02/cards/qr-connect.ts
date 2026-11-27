/**
 * QrConnect — shadcn/ui block `preview-02` (cards/qr-connect.tsx),
 * bases generation, ported 1:1 to Effect UI.
 *
 * Upstream: a stateless React function rendering a Card with a
 * `react-qr-code` `<QRCode>` (size 160, level "M") inside a white padded
 * wrapper, a centered header, and a secondary "Got it" button. Here: a
 * named view function with the same anatomy and class strings.
 *
 * Declared divergences (anything else is a bug):
 *
 * - The QR code is PRECOMPUTED and inlined as a static SVG: upstream
 *   generates it at runtime from the constant value
 *   "https://ledger.app/connect/jd-4829", so the rendered modules never
 *   change. The matrix below was generated once (outside the registry)
 *   with qrcode-generator — the same library react-qr-code builds on —
 *   at error-correction level "M", byte mode: a 29×29 module matrix
 *   (version 3), drawn as one filled path over a white background path
 *   at 160×160, exactly react-qr-code's SVG shape. The encoded value
 *   and level are unchanged; `react-qr-code` itself is not ported.
 * - The only prop is `class`, appended to the Card root's classes.
 */
import type { Html } from "@effect/ui/html";
import { Button } from "@/components/ui/button.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.ts";
import { cn } from "@/lib/utils";

/** The precomputed QR module path (29×29, level M) for the card's fixed value. */
const QR_PATH =
  "M0 0h1v1h-1zM1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM6 0h1v1h-1zM12 0h1v1h-1zM13 0h1v1h-1zM16 0h1v1h-1zM17 0h1v1h-1zM18 0h1v1h-1zM19 0h1v1h-1zM22 0h1v1h-1zM23 0h1v1h-1zM24 0h1v1h-1zM25 0h1v1h-1zM26 0h1v1h-1zM27 0h1v1h-1zM28 0h1v1h-1zM0 1h1v1h-1zM6 1h1v1h-1zM9 1h1v1h-1zM12 1h1v1h-1zM13 1h1v1h-1zM14 1h1v1h-1zM15 1h1v1h-1zM18 1h1v1h-1zM22 1h1v1h-1zM28 1h1v1h-1zM0 2h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM4 2h1v1h-1zM6 2h1v1h-1zM11 2h1v1h-1zM13 2h1v1h-1zM16 2h1v1h-1zM17 2h1v1h-1zM18 2h1v1h-1zM19 2h1v1h-1zM20 2h1v1h-1zM22 2h1v1h-1zM24 2h1v1h-1zM25 2h1v1h-1zM26 2h1v1h-1zM28 2h1v1h-1zM0 3h1v1h-1zM2 3h1v1h-1zM3 3h1v1h-1zM4 3h1v1h-1zM6 3h1v1h-1zM9 3h1v1h-1zM13 3h1v1h-1zM14 3h1v1h-1zM15 3h1v1h-1zM18 3h1v1h-1zM22 3h1v1h-1zM24 3h1v1h-1zM25 3h1v1h-1zM26 3h1v1h-1zM28 3h1v1h-1zM0 4h1v1h-1zM2 4h1v1h-1zM3 4h1v1h-1zM4 4h1v1h-1zM6 4h1v1h-1zM9 4h1v1h-1zM11 4h1v1h-1zM12 4h1v1h-1zM13 4h1v1h-1zM14 4h1v1h-1zM16 4h1v1h-1zM18 4h1v1h-1zM22 4h1v1h-1zM24 4h1v1h-1zM25 4h1v1h-1zM26 4h1v1h-1zM28 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM8 5h1v1h-1zM10 5h1v1h-1zM11 5h1v1h-1zM13 5h1v1h-1zM14 5h1v1h-1zM18 5h1v1h-1zM19 5h1v1h-1zM22 5h1v1h-1zM28 5h1v1h-1zM0 6h1v1h-1zM1 6h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM4 6h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM20 6h1v1h-1zM22 6h1v1h-1zM23 6h1v1h-1zM24 6h1v1h-1zM25 6h1v1h-1zM26 6h1v1h-1zM27 6h1v1h-1zM28 6h1v1h-1zM9 7h1v1h-1zM11 7h1v1h-1zM12 7h1v1h-1zM14 7h1v1h-1zM17 7h1v1h-1zM18 7h1v1h-1zM19 7h1v1h-1zM20 7h1v1h-1zM0 8h1v1h-1zM3 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM11 8h1v1h-1zM15 8h1v1h-1zM16 8h1v1h-1zM19 8h1v1h-1zM21 8h1v1h-1zM23 8h1v1h-1zM0 9h1v1h-1zM1 9h1v1h-1zM3 9h1v1h-1zM4 9h1v1h-1zM8 9h1v1h-1zM9 9h1v1h-1zM10 9h1v1h-1zM11 9h1v1h-1zM12 9h1v1h-1zM14 9h1v1h-1zM15 9h1v1h-1zM17 9h1v1h-1zM20 9h1v1h-1zM21 9h1v1h-1zM22 9h1v1h-1zM25 9h1v1h-1zM28 9h1v1h-1zM0 10h1v1h-1zM1 10h1v1h-1zM2 10h1v1h-1zM3 10h1v1h-1zM4 10h1v1h-1zM6 10h1v1h-1zM7 10h1v1h-1zM9 10h1v1h-1zM10 10h1v1h-1zM16 10h1v1h-1zM17 10h1v1h-1zM18 10h1v1h-1zM19 10h1v1h-1zM21 10h1v1h-1zM23 10h1v1h-1zM25 10h1v1h-1zM26 10h1v1h-1zM27 10h1v1h-1zM0 11h1v1h-1zM2 11h1v1h-1zM3 11h1v1h-1zM4 11h1v1h-1zM9 11h1v1h-1zM10 11h1v1h-1zM12 11h1v1h-1zM14 11h1v1h-1zM15 11h1v1h-1zM18 11h1v1h-1zM20 11h1v1h-1zM23 11h1v1h-1zM26 11h1v1h-1zM27 11h1v1h-1zM1 12h1v1h-1zM2 12h1v1h-1zM3 12h1v1h-1zM4 12h1v1h-1zM6 12h1v1h-1zM7 12h1v1h-1zM8 12h1v1h-1zM9 12h1v1h-1zM12 12h1v1h-1zM15 12h1v1h-1zM17 12h1v1h-1zM20 12h1v1h-1zM21 12h1v1h-1zM22 12h1v1h-1zM25 12h1v1h-1zM27 12h1v1h-1zM28 12h1v1h-1zM2 13h1v1h-1zM4 13h1v1h-1zM5 13h1v1h-1zM9 13h1v1h-1zM10 13h1v1h-1zM11 13h1v1h-1zM12 13h1v1h-1zM16 13h1v1h-1zM17 13h1v1h-1zM18 13h1v1h-1zM19 13h1v1h-1zM20 13h1v1h-1zM0 14h1v1h-1zM3 14h1v1h-1zM4 14h1v1h-1zM6 14h1v1h-1zM8 14h1v1h-1zM16 14h1v1h-1zM17 14h1v1h-1zM20 14h1v1h-1zM22 14h1v1h-1zM23 14h1v1h-1zM24 14h1v1h-1zM25 14h1v1h-1zM26 14h1v1h-1zM27 14h1v1h-1zM28 14h1v1h-1zM0 15h1v1h-1zM2 15h1v1h-1zM3 15h1v1h-1zM11 15h1v1h-1zM13 15h1v1h-1zM14 15h1v1h-1zM17 15h1v1h-1zM20 15h1v1h-1zM21 15h1v1h-1zM22 15h1v1h-1zM25 15h1v1h-1zM27 15h1v1h-1zM1 16h1v1h-1zM2 16h1v1h-1zM4 16h1v1h-1zM5 16h1v1h-1zM6 16h1v1h-1zM10 16h1v1h-1zM13 16h1v1h-1zM14 16h1v1h-1zM16 16h1v1h-1zM17 16h1v1h-1zM18 16h1v1h-1zM20 16h1v1h-1zM27 16h1v1h-1zM11 17h1v1h-1zM17 17h1v1h-1zM20 17h1v1h-1zM21 17h1v1h-1zM22 17h1v1h-1zM23 17h1v1h-1zM25 17h1v1h-1zM28 17h1v1h-1zM0 18h1v1h-1zM3 18h1v1h-1zM4 18h1v1h-1zM6 18h1v1h-1zM7 18h1v1h-1zM13 18h1v1h-1zM16 18h1v1h-1zM17 18h1v1h-1zM20 18h1v1h-1zM21 18h1v1h-1zM23 18h1v1h-1zM24 18h1v1h-1zM27 18h1v1h-1zM28 18h1v1h-1zM4 19h1v1h-1zM9 19h1v1h-1zM10 19h1v1h-1zM12 19h1v1h-1zM13 19h1v1h-1zM15 19h1v1h-1zM16 19h1v1h-1zM17 19h1v1h-1zM18 19h1v1h-1zM21 19h1v1h-1zM27 19h1v1h-1zM28 19h1v1h-1zM0 20h1v1h-1zM2 20h1v1h-1zM5 20h1v1h-1zM6 20h1v1h-1zM7 20h1v1h-1zM11 20h1v1h-1zM14 20h1v1h-1zM15 20h1v1h-1zM20 20h1v1h-1zM21 20h1v1h-1zM22 20h1v1h-1zM23 20h1v1h-1zM24 20h1v1h-1zM26 20h1v1h-1zM8 21h1v1h-1zM9 21h1v1h-1zM10 21h1v1h-1zM11 21h1v1h-1zM13 21h1v1h-1zM20 21h1v1h-1zM24 21h1v1h-1zM26 21h1v1h-1zM27 21h1v1h-1zM28 21h1v1h-1zM0 22h1v1h-1zM1 22h1v1h-1zM2 22h1v1h-1zM3 22h1v1h-1zM4 22h1v1h-1zM5 22h1v1h-1zM6 22h1v1h-1zM13 22h1v1h-1zM14 22h1v1h-1zM17 22h1v1h-1zM18 22h1v1h-1zM20 22h1v1h-1zM22 22h1v1h-1zM24 22h1v1h-1zM27 22h1v1h-1zM0 23h1v1h-1zM6 23h1v1h-1zM8 23h1v1h-1zM9 23h1v1h-1zM11 23h1v1h-1zM13 23h1v1h-1zM15 23h1v1h-1zM16 23h1v1h-1zM20 23h1v1h-1zM24 23h1v1h-1zM25 23h1v1h-1zM26 23h1v1h-1zM27 23h1v1h-1zM28 23h1v1h-1zM0 24h1v1h-1zM2 24h1v1h-1zM3 24h1v1h-1zM4 24h1v1h-1zM6 24h1v1h-1zM14 24h1v1h-1zM17 24h1v1h-1zM20 24h1v1h-1zM21 24h1v1h-1zM22 24h1v1h-1zM23 24h1v1h-1zM24 24h1v1h-1zM28 24h1v1h-1zM0 25h1v1h-1zM2 25h1v1h-1zM3 25h1v1h-1zM4 25h1v1h-1zM6 25h1v1h-1zM8 25h1v1h-1zM9 25h1v1h-1zM10 25h1v1h-1zM12 25h1v1h-1zM14 25h1v1h-1zM16 25h1v1h-1zM17 25h1v1h-1zM22 25h1v1h-1zM23 25h1v1h-1zM24 25h1v1h-1zM25 25h1v1h-1zM26 25h1v1h-1zM27 25h1v1h-1zM0 26h1v1h-1zM2 26h1v1h-1zM3 26h1v1h-1zM4 26h1v1h-1zM6 26h1v1h-1zM9 26h1v1h-1zM12 26h1v1h-1zM17 26h1v1h-1zM24 26h1v1h-1zM25 26h1v1h-1zM26 26h1v1h-1zM28 26h1v1h-1zM0 27h1v1h-1zM6 27h1v1h-1zM10 27h1v1h-1zM11 27h1v1h-1zM15 27h1v1h-1zM16 27h1v1h-1zM17 27h1v1h-1zM20 27h1v1h-1zM21 27h1v1h-1zM23 27h1v1h-1zM27 27h1v1h-1zM0 28h1v1h-1zM1 28h1v1h-1zM2 28h1v1h-1zM3 28h1v1h-1zM4 28h1v1h-1zM5 28h1v1h-1zM6 28h1v1h-1zM8 28h1v1h-1zM12 28h1v1h-1zM13 28h1v1h-1zM15 28h1v1h-1zM17 28h1v1h-1zM18 28h1v1h-1zM20 28h1v1h-1zM21 28h1v1h-1zM23 28h1v1h-1zM25 28h1v1h-1zM27 28h1v1h-1z";

export const QrConnect = <Msg>(
  h: Html.H<Msg>,
  options: { readonly class?: string | undefined } = {},
) =>
  Card(h, { class: cn(options.class) }).children(
    CardContent(h, { class: "flex justify-center pt-6" }).children(
      h.div.class("rounded-xl border bg-white p-4").children(
        h
          .el("svg")
          .attrs({
            width: "160",
            height: "160",
            viewBox: "0 0 29 29",
          })
          .children(
            h
              .el("path")
              .attrs({ fill: "#FFFFFF", d: "M0 0h29v29H0z", "shape-rendering": "crispEdges" }),
            h.el("path").attrs({ fill: "#000000", d: QR_PATH, "shape-rendering": "crispEdges" }),
          ),
      ),
    ),
    CardHeader(h, { class: "text-center" }).children(
      CardTitle(h).children("Scan to connect your mobile device"),
      CardDescription(h).children(
        "Open the Ledger mobile app and scan this code to link your device.",
      ),
    ),
    CardFooter(h).children(Button(h, { variant: "secondary", class: "w-full" }).children("Got it")),
  );
