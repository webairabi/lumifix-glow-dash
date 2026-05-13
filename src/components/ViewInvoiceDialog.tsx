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
const A4_H_MM = 297;
// Template pixel dimensions (matches InvoiceTemplate)
const TEMPLATE_W_PX = 794;
const TEMPLATE_H_PX = 1123;

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
        windowHeight: TEMPLATE_H_PX,
        width: TEMPLATE_W_PX,
        height: TEMPLATE_H_PX,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      // Scale-to-fit: preserve aspect, never overflow either dimension
      const ratio = Math.min(pdfW / A4_W_MM, pdfH / A4_H_MM); // = 1, but explicit
      const imgAspect = canvas.width / canvas.height;
      const pageAspect = pdfW / pdfH;

      let drawW: number;
      let drawH: number;
      if (imgAspect > pageAspect) {
        drawW = pdfW * ratio;
        drawH = drawW / imgAspect;
      } else {
        drawH = pdfH * ratio;
        drawW = drawH * imgAspect;
      }
      const offsetX = (pdfW - drawW) / 2;
      const offsetY = (pdfH - drawH) / 2;

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", offsetX, offsetY, drawW, drawH);
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

        {/* Off-screen, fixed A4-sized clone used exclusively for PDF capture.
            Guarantees the canvas is always exactly A4 proportions. */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: `${TEMPLATE_W_PX}px`,
            height: `${TEMPLATE_H_PX}px`,
            overflow: "hidden",
            background: "#ffffff",
            pointerEvents: "none",
          }}
        >
          <div
            ref={offscreenRef}
            style={{
              width: `${TEMPLATE_W_PX}px`,
              height: `${TEMPLATE_H_PX}px`,
              overflow: "hidden",
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
