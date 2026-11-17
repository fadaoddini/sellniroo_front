'use client'

import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { FileDown, Printer } from 'lucide-react'
import InvoiceDocument from './InvoiceDocument'

function remainingOf(job) {
  if (!job) return 0
  if (job.invoice?.remaining != null) return Math.max(0, Number(job.invoice.remaining) || 0)
  const grand = Number(job.grand_total || 0)
  const paid = Number(job.paid_total || 0)
  return Math.max(0, grand - paid)
}

/** فاکتور فقط وقتی تکمیل و تسویه قطعی شده باشد. */
export function canDownloadRepairInvoice(job) {
  if (!job) return false
  if (job.printable === true) return true
  if (job.printable === false) return false
  if (job.status !== 'completed') return false
  return remainingOf(job) <= 0
}

/**
 * دکمه چاپ/دانلود PDF فاکتور A4
 */
export default function InvoicePrintButton({
  job,
  companyTitle,
  className,
  label = 'دانلود PDF فاکتور',
  ghostClassName,
}) {
  const ref = useRef(null)
  const handlePrint = useReactToPrint({
    contentRef: ref,
    documentTitle: `invoice-${job?.code || 'repair'}`,
    pageStyle: `
      @page { size: A4; margin: 8mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
  })

  if (!canDownloadRepairInvoice(job)) return null

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => handlePrint()}
      >
        <FileDown size={14} />
        {label}
      </button>
      {ghostClassName ? (
        <button
          type="button"
          className={ghostClassName}
          onClick={() => handlePrint()}
        >
          <Printer size={13} />
          چاپ
        </button>
      ) : null}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '210mm',
          pointerEvents: 'none',
        }}
      >
        <InvoiceDocument
          ref={ref}
          job={job}
          companyTitle={companyTitle || job.invoice?.company_title}
        />
      </div>
    </>
  )
}
