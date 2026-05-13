import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Eye, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Invoice } from "@/hooks/useFinance";
import { InvoiceTemplate } from "./InvoiceTemplate";

// A4 in mm
const A4_W_MM = 210;

// Template pixel width (matches InvoiceTemplate). Height is dynamic.
const TEMPLATE_W_PX = 794;

export function ViewInvoiceDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const node = offscreenRef.current;
    if (!node) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: TEMPLATE_W_PX,
        width: TEMPLATE_W_PX,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      // Map captured canvas width → A4 width (mm). Then page height in source px.
      const pxPerMm = canvas.width / pdfW;
      const pageHeightPx = Math.floor(pdfH * pxPerMm);
      const totalHeightPx = canvas.height;

      // Single-page fast path
      if (totalHeightPx <= pageHeightPx) {
        const drawH = totalHeightPx / pxPerMm;
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, pdfW, drawH);
      } else {
        // Slice the source canvas into A4-page-sized chunks.
        let renderedPx = 0;
        let pageIndex = 0;
        const sliceCanvas = document.createElement("canvas");
        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D not available");

        while (renderedPx < totalHeightPx) {
          const sliceHeight = Math.min(pageHeightPx, totalHeightPx - renderedPx);
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(
            canvas,
            0, renderedPx, canvas.width, sliceHeight,
            0, 0, canvas.width, sliceHeight,
          );
          const drawH = sliceHeight / pxPerMm;
          const imgData = sliceCanvas.toDataURL("image/jpeg", 0.95);
          if (pageIndex > 0) pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, 0, pdfW, drawH);
          renderedPx += sliceHeight;
          pageIndex += 1;
        }
      }

      pdf.save(`Invoice-${invoice.invoice_no}.pdf`);
      toast.success("Invoice PDF downloaded");
    } catch (e) {
      toast.error("Failed to generate PDF");
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 text-muted-foreground hover:text-gold"
        aria-label="View invoice"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>
      <DialogContent className="bg-card max-w-[860px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Invoice {invoice.invoice_no}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto rounded border border-border/50 bg-white">
          <InvoiceTemplate ref={ref} invoice={invoice} />
        </div>

        {/* Off-screen clone used for PDF capture. Width is fixed to A4 ratio;
            height grows naturally so multi-page invoices render fully. */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: `${TEMPLATE_W_PX}px`,
            background: "#ffffff",
            pointerEvents: "none",
          }}
        >
          <div
            ref={offscreenRef}
            style={{
              width: `${TEMPLATE_W_PX}px`,
              background: "#ffffff",
            }}
          >
            <InvoiceTemplate invoice={invoice} />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Generating..." : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
