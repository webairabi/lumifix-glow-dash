## Goal
Ensure the generated invoice PDF always fits on a single A4 page, regardless of how many line items or how much content is in the invoice — no clipping, no awkward scaling, no second blank page.

## Changes (all in `src/components/ViewInvoiceDialog.tsx`)

1. **Render at fixed A4 aspect ratio before capture**
   - Wrap `InvoiceTemplate` in an off-screen container sized to exact A4 proportions at the template's pixel width (794 × 1123 px = 210 × 297 mm at 96dpi).
   - Pass `windowWidth: 794` and `height: 1123` to `html2canvas` so the captured canvas is always one full A4 page in proportion.

2. **Scale-to-fit math when adding to jsPDF**
   - Compute scale = `min(pdfW / imgW_mm, pdfH / imgH_mm)` so the image always fits within page bounds (currently we force width = pdfW, which can overflow height and clip).
   - Center the image on the page using the leftover margin.
   - Use a single `pdf.addImage(...)` call with no second page.

3. **Adaptive spacer rows in `InvoiceTemplate.tsx`** (small tweak)
   - Currently always renders 8 spacer rows. For invoices that may grow later (multi-line items), cap total rows so the rendered template never exceeds 1123 px. For now (single-line invoice), reduce spacer rows slightly if needed to guarantee fit, or rely solely on the scale-to-fit math above.
   - Keep this minimal — the scale-to-fit fix in step 2 is the durable solution.

4. **Use JPEG instead of PNG**
   - `canvas.toDataURL("image/jpeg", 0.95)` + `pdf.addImage(..., "JPEG", ...)` — smaller file, same visual quality for an invoice, and avoids occasional jsPDF PNG sizing quirks.

## Technical notes
- Keep `scale: 2` in html2canvas for crisp output.
- A4 in mm: 210 × 297. jsPDF's `getWidth()` / `getHeight()` already returns mm.
- The fit calculation: `ratio = Math.min(pdfW / (canvas.width * mmPerPx), pdfH / (canvas.height * mmPerPx))` then draw at `canvas.width * mmPerPx * ratio` × `canvas.height * mmPerPx * ratio`, centered.

## Out of scope
- Multi-page invoices (would need pagination logic in the template itself).
- Changes to the invoice visual design.
