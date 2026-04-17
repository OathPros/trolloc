const RECIPIENT = "lukegag2@gmail.com";

export function buildOrderEmail({ checkout, cartLines, total }) {
  const timestamp = new Date().toLocaleString();
  const subject = `Computer Order Request - ${checkout.name || "Unknown"} - ${checkout.department || "Unknown"}`;

  const lineText = cartLines
    .map((line, index) => `${index + 1}. ${line.name} | Qty: ${line.qty} | Unit: ${currency(line.price)} | Line: ${currency(line.lineTotal)}`)
    .join("\n");

  const crpSection = checkout.isCrp === "yes"
    ? `CRP Status: Yes\nCRP Project Code: ${checkout.crpProjectCode}\nCRP Approver Name: ${checkout.crpApprover}\nCRP End Date: ${checkout.crpEndDate}`
    : "CRP Status: No";

  const body = [
    "Computer Order Request",
    "",
    `Requester Name: ${checkout.name}`,
    `Department: ${checkout.department}`,
    `Budget Number: ${checkout.budget}`,
    crpSection,
    "",
    "Line Items:",
    lineText,
    "",
    `Order Total: ${currency(total)}`,
    `Timestamp: ${timestamp}`
  ].join("\n");

  const mailto = `mailto:${encodeURIComponent(RECIPIENT)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { subject, body, mailto };
}

export function currency(amount) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);
}
