// app/resume/[slug]/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Config from "@/config/config";
import { useReactToPrint } from "react-to-print";
import ModernTemplate from "@/modules/profile/components/resume/templates/ModernTemplate";
import ClassicTemplate from "@/modules/profile/components/resume/templates/ClassicTemplate";
import { Loader2, AlertCircle, Download } from "lucide-react";

export default function PublicResumePage() {
  const params = useParams();
  const slug = params.slug;

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `resume-${slug}`,
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    `,
    onAfterPrint: async () => {
      try {
        await axios.post(Config.endpoints.jobisell.publicResume.download(slug));
      } catch (e) {}
    },
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get(
          Config.endpoints.jobisell.publicResume.detail(slug)
        );
        setResume(res.data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "رزومه یافت نشد یا منتشر نشده است"
            : "خطا در دریافت رزومه"
        );
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchResume();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12, padding: 20 }}>
        <AlertCircle size={48} color="#dc2626" />
        <h2>{error}</h2>
      </div>
    );
  }

  const TemplateComponent =
    resume.template === "classic" ? ClassicTemplate : ModernTemplate;

  return (
    <div style={{ padding: "20px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "210mm", margin: "0 auto" }}>
        <button
          onClick={handlePrint}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Download size={16} />
          دانلود PDF
        </button>

        <div ref={printRef} style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <TemplateComponent resume={resume} />
        </div>
      </div>
    </div>
  );
}