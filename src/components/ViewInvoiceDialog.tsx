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

export function ViewInvoiceDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;
      const finalH = Math.min(imgH, pdfH);
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, finalH);
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
