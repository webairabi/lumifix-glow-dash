import { forwardRef } from "react";
import type { Invoice } from "@/hooks/useFinance";
import { formatAED } from "@/lib/format";

const COMPANY = {
  name: "LUMIFIX FOR ELECTRICAL EXTENSIONS AND INSTALLATIONS - L.L.C-S.P.C.",
  email: "owaisylight@gmail.com",
  phone: "+971 565916248",
  licenseNo: "CN-6494485",
  adcciNo: "8800144949",
  emirate: "Abu Dhabi",
  country: "UAE",
};

function amountToWords(num: number): string {
  // Simple integer to words for AED display
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return (b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "")).trim();
    if (n < 1000) return (a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "")).trim();
    if (n < 1_000_000) return (inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "")).trim();
    return (inWords(Math.floor(n / 1_000_000)) + " Million" + (n % 1_000_000 ? " " + inWords(n % 1_000_000) : "")).trim();
  };
  const whole = Math.floor(num);
  const fils = Math.round((num - whole) * 100);
  const main = whole === 0 ? "Zero" : inWords(whole);
  return `UAE Dirham ${main}${fils ? ` and ${inWords(fils)} Fils` : " Only"} (AED ${formatAED(num)})`;
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, { invoice: Invoice }>(
  function InvoiceTemplate({ invoice }, ref) {
    const date = new Date(invoice.created_at).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "2-digit",
    });
    const amount = Number(invoice.amount);

    return (
      <div
        ref={ref}
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "32px",
          background: "#ffffff",
          color: "#000000",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "12px",
          lineHeight: 1.4,
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>
          Tax Invoice
        </div>

        {/* Header table */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", width: "50%", verticalAlign: "top" }}>
                <div style={{ fontWeight: 700, fontSize: "13px" }}>{COMPANY.name}</div>
                <div>Emirate: {COMPANY.emirate}</div>
                <div>Country: {COMPANY.country}</div>
                <div>Email: {COMPANY.email}</div>
                <div>Phone: {COMPANY.phone}</div>
                <div>Licence No.: {COMPANY.licenseNo}</div>
                <div>ADCCI No.: {COMPANY.adcciNo}</div>
              </td>
              <td style={{ border: "1px solid #000", padding: 0, verticalAlign: "top" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "6px", width: "50%" }}>
                        <div style={{ fontSize: "11px" }}>Invoice No.</div>
                        <div style={{ fontWeight: 700 }}>{invoice.invoice_no}</div>
                      </td>
                      <td style={{ border: "1px solid #000", padding: "6px", width: "50%" }}>
                        <div style={{ fontSize: "11px" }}>Dated</div>
                        <div style={{ fontWeight: 700 }}>{date}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "6px", height: "36px" }}>Delivery Note</td>
                      <td style={{ border: "1px solid #000", padding: "6px" }}>Mode/Terms of Payment</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "6px", height: "36px" }}>Supplier&apos;s Ref.</td>
                      <td style={{ border: "1px solid #000", padding: "6px" }}>Other Reference(s)</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", verticalAlign: "top", height: "120px" }}>
                <div>Buyer</div>
                <div style={{ fontWeight: 700, fontSize: "13px", marginTop: "4px" }}>{invoice.team}</div>
                <div style={{ marginTop: "8px" }}>Place of supply: UAE, {COMPANY.emirate}</div>
              </td>
              <td style={{ border: "1px solid #000", padding: 0, verticalAlign: "top" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "6px", width: "50%", height: "36px" }}>Buyer&apos;s Order No.</td>
                      <td style={{ border: "1px solid #000", padding: "6px", width: "50%" }}>Dated</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "6px", height: "36px" }}>Despatch Document No.</td>
                      <td style={{ border: "1px solid #000", padding: "6px" }}>Delivery Note Date</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "6px", height: "36px" }}>Despatched through</td>
                      <td style={{ border: "1px solid #000", padding: "6px" }}>Destination</td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ border: "1px solid #000", padding: "6px", height: "36px" }}>Terms of Delivery</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Line items */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", borderTop: "none" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #000", padding: "6px", width: "40px" }}>Sl No.</th>
              <th style={{ border: "1px solid #000", padding: "6px", textAlign: "left" }}>Description of Goods / Services</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "80px" }}>Quantity</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "100px" }}>Rate</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "50px" }}>per</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "120px" }}>Amount (AED)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px", verticalAlign: "top" }}>1</td>
              <td style={{ border: "1px solid #000", padding: "6px", verticalAlign: "top", fontWeight: 700 }}>
                {invoice.team} — Services Rendered
              </td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right", verticalAlign: "top" }}>1 nos</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right", verticalAlign: "top" }}>{formatAED(amount)}</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", verticalAlign: "top" }}>nos</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right", verticalAlign: "top", fontWeight: 700 }}>{formatAED(amount)}</td>
            </tr>
            {/* spacer rows for the look */}
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #000", padding: "6px", height: "22px" }}>&nbsp;</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}></td>
                <td style={{ border: "1px solid #000", padding: "6px" }}></td>
                <td style={{ border: "1px solid #000", padding: "6px" }}></td>
                <td style={{ border: "1px solid #000", padding: "6px" }}></td>
                <td style={{ border: "1px solid #000", padding: "6px" }}></td>
              </tr>
            ))}
            <tr>
              <td style={{ border: "1px solid #000", padding: "6px" }}></td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right", fontWeight: 700 }}>Total</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right", fontWeight: 700 }}>1 nos</td>
              <td style={{ border: "1px solid #000", padding: "6px" }}></td>
              <td style={{ border: "1px solid #000", padding: "6px" }}></td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right", fontWeight: 700 }}>
                AED {formatAED(amount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", borderTop: "none" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px" }}>
                <div>Amount Chargeable (in words)</div>
                <div style={{ fontWeight: 700, marginTop: "4px" }}>{amountToWords(amount)}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Declaration & signatory */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", borderTop: "none", marginBottom: "16px" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", width: "60%", verticalAlign: "top", height: "120px" }}>
                <div style={{ fontWeight: 700 }}>Declaration</div>
                <div style={{ marginTop: "4px" }}>
                  We declare that this invoice shows the actual price of the goods/services described
                  and that all particulars are true and correct.
                </div>
              </td>
              <td style={{ border: "1px solid #000", padding: "8px", verticalAlign: "bottom" }}>
                <div style={{ textAlign: "right", fontWeight: 700 }}>for {COMPANY.name}</div>
                <div style={{ marginTop: "48px", textAlign: "right" }}>Authorised Signatory</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: "center", fontSize: "11px" }}>This is a Computer Generated Invoice</div>
      </div>
    );
  }
);
