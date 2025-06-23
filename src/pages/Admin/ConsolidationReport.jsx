import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { UserData } from "../../context/UserContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] ? acc[key] + 1 : 1;
    return acc;
  }, {});
}

function unique(arr, key) {
  return Array.from(new Set(arr.map(item => item[key] || "Unknown")));
}

function getYears(arr, dateKey) {
  return Array.from(new Set(arr.map(item => item[dateKey] ? new Date(item[dateKey]).getFullYear() : null).filter(Boolean)));
}

export default function ConsolidationReport() {
  const { user } = UserData();
  const [scholars, setScholars] = useState([]);
  const [odRequests, setOdRequests] = useState([]);
  const [publications, setPublications] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [scholarDept, setScholarDept] = useState("");
  const [scholarSupervisor, setScholarSupervisor] = useState("");
  const [scholarStatus, setScholarStatus] = useState("");
  const [scholarYear, setScholarYear] = useState("");
  const [odType, setOdType] = useState("");
  const [odFaculty, setOdFaculty] = useState("");
  const [odStatus, setOdStatus] = useState("");
  const [odYear, setOdYear] = useState("");
  const [pubFaculty, setPubFaculty] = useState("");
  const [pubYear, setPubYear] = useState("");
  const [pubType, setPubType] = useState("");
  const [facultyDept, setFacultyDept] = useState("");
  const [facultyPosition, setFacultyPosition] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Drilldown state
  const [drilldown, setDrilldown] = useState({ open: false, title: "", data: [] });

  // Filtering logic
  const filteredScholars = scholars.filter(s => {
    let ok = true;
    if (scholarDept && s.department !== scholarDept) ok = false;
    if (scholarSupervisor && s.supervisor?.name !== scholarSupervisor) ok = false;
    if (scholarStatus) {
      const isCurrent = !s.dateOfCompletion || new Date(s.dateOfCompletion) >= new Date();
      if (scholarStatus === "Current" && !isCurrent) ok = false;
      if (scholarStatus === "Completed" && isCurrent) ok = false;
    }
    if (scholarYear && s.dateOfJoining && new Date(s.dateOfJoining).getFullYear().toString() !== scholarYear) ok = false;
    if (dateFrom && new Date(s.dateOfJoining) < new Date(dateFrom)) ok = false;
    if (dateTo && new Date(s.dateOfJoining) > new Date(dateTo)) ok = false;
    return ok;
  });
  const filteredOD = odRequests.filter(r => {
    let ok = true;
    if (odType && r.requestType !== odType) ok = false;
    if (odFaculty && r.name !== odFaculty) ok = false;
    if (odStatus && r.status !== odStatus) ok = false;
    if (odYear && r.date && new Date(r.date).getFullYear().toString() !== odYear) ok = false;
    if (dateFrom && new Date(r.date) < new Date(dateFrom)) ok = false;
    if (dateTo && new Date(r.date) > new Date(dateTo)) ok = false;
    return ok;
  });
  const filteredPubs = publications.filter(p => {
    let ok = true;
    if (pubFaculty && ((Array.isArray(p.authors) ? p.authors[0] : p.authors) !== pubFaculty)) ok = false;
    if (pubYear && p.publicationDate && new Date(p.publicationDate).getFullYear().toString() !== pubYear) ok = false;
    if (pubType && p.type !== pubType) ok = false;
    if (dateFrom && new Date(p.publicationDate) < new Date(dateFrom)) ok = false;
    if (dateTo && new Date(p.publicationDate) > new Date(dateTo)) ok = false;
    return ok;
  });
  const filteredFaculty = faculty.filter(f => {
    let ok = true;
    if (facultyDept && f.department !== facultyDept) ok = false;
    if (facultyPosition && f.position !== facultyPosition) ok = false;
    return ok;
  });

  // Scholar breakdowns
  const scholarsByArea = useMemo(() => groupBy(filteredScholars, s => s.areaOfResearch || "Unknown"), [filteredScholars]);
  const scholarsBySupervisor = useMemo(() => groupBy(filteredScholars, s => s.supervisor?.name || "Unknown"), [filteredScholars]);
  const scholarsByDept = useMemo(() => groupBy(filteredScholars, s => s.department || "Unknown"), [filteredScholars]);
  const scholarsByJoiningYear = useMemo(() => groupBy(filteredScholars, s => s.dateOfJoining ? new Date(s.dateOfJoining).getFullYear() : "Unknown"), [filteredScholars]);
  const scholarsByCompletionYear = useMemo(() => groupBy(filteredScholars.filter(s => s.dateOfCompletion), s => new Date(s.dateOfCompletion).getFullYear()), [filteredScholars]);
  const scholarStatusCounts = useMemo(() => {
    let status = { Current: 0, Completed: 0 };
    filteredScholars.forEach(s => {
      if (s.dateOfCompletion && new Date(s.dateOfCompletion) < new Date()) status.Completed++;
      else status.Current++;
    });
    return status;
  }, [filteredScholars]);

  // UI state for Show All
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [showAllSupervisors, setShowAllSupervisors] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [schRes, odRes, pubRes, facRes] = await Promise.all([
          axios.get("http://localhost:5000/api/pgscholars", { headers: { "x-user-email": user.email } }),
          axios.get("http://localhost:5000/api/odrequests", { headers: { "x-user-email": user.email } }),
          axios.get("http://localhost:5000/api/publications", { headers: { "x-user-email": user.email } }),
          axios.get("http://localhost:5000/api/faculty", { headers: { "x-user-email": user.email } }),
        ]);
        setScholars(schRes.data);
        setOdRequests(odRes.data);
        setPublications(pubRes.data);
        setFaculty(facRes.data);
      } catch (err) {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.email]);

  // Scholars summary
  const totalScholars = filteredScholars.length;
  const currentScholars = filteredScholars.filter(s => !s.dateOfCompletion || new Date(s.dateOfCompletion) >= new Date()).length;
  const completedScholars = filteredScholars.filter(s => s.dateOfCompletion && new Date(s.dateOfCompletion) < new Date()).length;

  // OD Requests summary
  const totalOD = filteredOD.length;
  const pendingOD = filteredOD.filter(r => r.status === "Pending").length;
  const approvedOD = filteredOD.filter(r => r.status === "Approved").length;
  const rejectedOD = filteredOD.filter(r => r.status === "Rejected").length;
  const odByType = groupBy(filteredOD, r => r.requestType || "Unknown");
  const odByFaculty = groupBy(filteredOD, r => r.name || "Unknown");

  // Publications summary
  const totalPublications = filteredPubs.length;
  const pubsByYear = groupBy(filteredPubs, p => (p.publicationDate ? new Date(p.publicationDate).getFullYear() : "Unknown"));
  const pubsByFaculty = groupBy(filteredPubs, p => (Array.isArray(p.authors) ? p.authors[0] : p.authors) || "Unknown");

  // Faculty summary
  const totalFaculty = filteredFaculty.length;
  const activeFaculty = filteredFaculty.filter(f => f.isActive).length;
  const inactiveFaculty = filteredFaculty.filter(f => !f.isActive).length;
  const facultyByDept = groupBy(filteredFaculty, f => f.department || "Unknown");
  const facultyByPosition = groupBy(filteredFaculty, f => f.position || "Unknown");

  // Export CSV for summary
  function exportSummaryCSV() {
    const rows = [
      ["Metric", "Value"],
      ["Total Scholars", totalScholars],
      ["Current Scholars", currentScholars],
      ["Completed Scholars", completedScholars],
      ["Total OD Requests", totalOD],
      ["Pending OD Requests", pendingOD],
      ["Approved OD Requests", approvedOD],
      ["Rejected OD Requests", rejectedOD],
      ["Total Publications", totalPublications],
      ["Total Faculty", totalFaculty],
      ["Active Faculty", activeFaculty],
      ["Inactive Faculty", inactiveFaculty],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "consolidation_report_summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Drilldown modal
  function DrilldownModal() {
    if (!drilldown.open) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-[2000] flex items-center justify-center">
        <div className="bg-white rounded shadow-lg p-6 max-h-[80vh] w-[90vw] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{drilldown.title}</h2>
            <button onClick={() => setDrilldown({ open: false, title: '', data: [] })} className="text-2xl">&times;</button>
          </div>
          <pre className="text-xs overflow-x-auto">{JSON.stringify(drilldown.data, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // Helper for date formatting
  function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Scholar lists
  const currentScholarsList = filteredScholars.filter(s => !s.dateOfCompletion || new Date(s.dateOfCompletion) >= new Date());
  const completedScholarsList = filteredScholars.filter(s => s.dateOfCompletion && new Date(s.dateOfCompletion) < new Date());
  const nearingCompletionList = filteredScholars.filter(s => {
    if (!s.dateOfCompletion) return false;
    const now = new Date();
    const completion = new Date(s.dateOfCompletion);
    const diffMonths = (completion.getFullYear() - now.getFullYear()) * 12 + (completion.getMonth() - now.getMonth());
    return diffMonths >= 0 && diffMonths <= 6;
  });

  // Pie chart for scholar status
  function ScholarStatusPie() {
    const total = scholarStatusCounts.Current + scholarStatusCounts.Completed;
    const currentPct = total ? (scholarStatusCounts.Current / total) * 100 : 0;
    const completedPct = total ? (scholarStatusCounts.Completed / total) * 100 : 0;
    // SVG pie chart (simple, 2-slice)
    const r = 40, c = 50, cy = 50;
    const angle = (currentPct / 100) * 360;
    const largeArc = currentPct > 50 ? 1 : 0;
    const x = c + r * Math.cos((Math.PI / 180) * (angle - 90));
    const y = cy + r * Math.sin((Math.PI / 180) * (angle - 90));
    const d = `M${c},${cy - r} A${r},${r} 0 ${largeArc} 1 ${x},${y} L${c},${cy} Z`;
    return (
      <div className="flex flex-col items-center">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle cx={c} cy={cy} r={r} fill="#e5e7eb" />
          <path d={d} fill="#60a5fa" />
          <circle cx={c} cy={cy} r={r * 0.6} fill="#fff" />
          <text x={c} y={cy} textAnchor="middle" dy=".3em" fontSize="16" fontWeight="bold">{total}</text>
        </svg>
        <div className="flex gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>Current ({scholarStatusCounts.Current}, {currentPct.toFixed(1)}%)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span>Completed ({scholarStatusCounts.Completed}, {completedPct.toFixed(1)}%)</div>
        </div>
      </div>
    );
  }

  // Horizontal bar chart for top N breakdowns
  function HorizontalBarChart({ data, color, label, showAll, setShowAll, max = 5 }) {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const shown = showAll ? entries : entries.slice(0, max);
    const maxVal = Math.max(...entries.map(e => e[1]), 1);
    return (
      <div>
        <div className="space-y-1">
          {shown.map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="w-32 truncate text-xs font-medium">{k}</span>
              <div className="flex-1 h-4 bg-gray-100 rounded relative">
                <div className="absolute left-0 top-0 h-4 rounded" style={{ width: `${(v / maxVal) * 100}%`, background: color }} />
                <span className="absolute left-2 top-0 text-xs text-white font-bold">{v}</span>
              </div>
            </div>
          ))}
        </div>
        {entries.length > max && (
          <button className="mt-2 text-xs text-blue-600 underline" onClick={() => setShowAll(s => !s)}>
            {showAll ? 'Show Top 5' : `Show All (${entries.length})`}
          </button>
        )}
      </div>
    );
  }

  // Stacked bar chart for year trends
  function ScholarsStackedBarChart() {
    const years = Array.from(new Set([
      ...Object.keys(scholarsByJoiningYear),
      ...Object.keys(scholarsByCompletionYear)
    ])).filter(y => y !== 'Unknown').sort();
    const maxVal = Math.max(...years.map(y => (scholarsByJoiningYear[y] || 0) + (scholarsByCompletionYear[y] || 0)), 1);
    return (
      <div className="w-full max-w-2xl">
        <div className="flex gap-2 text-xs mb-1">
          <span className="w-16">Year</span>
          <span className="flex-1 text-center">Joined</span>
          <span className="flex-1 text-center">Completed</span>
        </div>
        {years.map(y => (
          <div key={y} className="flex items-center gap-2 mb-1">
            <span className="w-16 font-mono">{y}</span>
            <div className="flex-1 h-4 bg-blue-100 rounded relative">
              <div className="absolute left-0 top-0 h-4 bg-blue-500 rounded-l" style={{ width: `${((scholarsByJoiningYear[y] || 0) / maxVal) * 100}%` }} />
              <span className="absolute left-2 top-0 text-xs text-white">{scholarsByJoiningYear[y] || 0}</span>
            </div>
            <div className="flex-1 h-4 bg-green-100 rounded relative">
              <div className="absolute left-0 top-0 h-4 bg-green-500 rounded-l" style={{ width: `${((scholarsByCompletionYear[y] || 0) / maxVal) * 100}%` }} />
              <span className="absolute left-2 top-0 text-xs text-white">{scholarsByCompletionYear[y] || 0}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Advanced Analytics
  // 1. Average Duration
  const completedScholarsForDuration = filteredScholars.filter(s => s.dateOfJoining && s.dateOfCompletion);
  const avgDurationMonths = completedScholarsForDuration.length > 0
    ? completedScholarsForDuration.reduce((sum, s) => {
        const start = new Date(s.dateOfJoining);
        const end = new Date(s.dateOfCompletion);
        return sum + ((end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
      }, 0) / completedScholarsForDuration.length
    : 0;
  const avgDurationYears = Math.floor(avgDurationMonths / 12);
  const avgDurationRemMonths = Math.round(avgDurationMonths % 12);

  // 2. Supervisor Load
  const supervisorLoads = useMemo(() => {
    const map = {};
    filteredScholars.forEach(s => {
      const sup = s.supervisor?.name || 'Unknown';
      map[sup] = (map[sup] || 0) + 1;
    });
    return map;
  }, [filteredScholars]);
  const supervisorLoadEntries = Object.entries(supervisorLoads).sort((a, b) => b[1] - a[1]);
  const maxLoad = Math.max(...supervisorLoadEntries.map(e => e[1]), 1);
  const minLoad = Math.min(...supervisorLoadEntries.map(e => e[1]), 0);

  // Scholars trends data for visualization
  const trendsYears = Array.from(new Set([
    ...Object.keys(scholarsByJoiningYear),
    ...Object.keys(scholarsByCompletionYear)
  ])).filter(y => y !== 'Unknown').sort();
  const trendsJoined = trendsYears.map(y => scholarsByJoiningYear[y] || 0);
  const trendsCompleted = trendsYears.map(y => scholarsByCompletionYear[y] || 0);

  // Pie chart for area, supervisor, status
  function PieChart({ data, colors, label }) {
    const entries = Object.entries(data);
    const total = entries.reduce((sum, [, v]) => sum + v, 0);
    if (total === 0) {
      return (
        <div className="flex flex-col items-center">
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={40} fill="#e5e7eb" />
          </svg>
          <div className="text-gray-400 mt-2">No data</div>
          <div className="text-xs text-gray-500 mt-1">{label}</div>
        </div>
      );
    }
    let acc = 0;
    const slices = entries.map(([k, v], i) => {
      const start = acc;
      const angle = (v / total) * 360;
      acc += angle;
      const large = angle > 180 ? 1 : 0;
      const r = 40, c = 50, cy = 50;
      const x1 = c + r * Math.cos((Math.PI / 180) * (start - 90));
      const y1 = cy + r * Math.sin((Math.PI / 180) * (start - 90));
      const x2 = c + r * Math.cos((Math.PI / 180) * (acc - 90));
      const y2 = cy + r * Math.sin((Math.PI / 180) * (acc - 90));
      const d = `M${c},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
      // Use only hex/rgb/hsl colors
      const safeColor = colors[i % colors.length].replace('oklch', '#888');
      return <path key={k} d={d} fill={safeColor} />;
    });
    return (
      <div className="flex flex-col items-center">
        <svg width="120" height="120" viewBox="0 0 100 100">
          {slices}
          <circle cx={50} cy={50} r={24} fill="#fff" />
          <text x={50} y={50} textAnchor="middle" dy=".3em" fontSize="16" fontWeight="bold">{total}</text>
        </svg>
        <div className="flex flex-wrap gap-2 mt-2 text-xs justify-center">
          {entries.map(([k, v], i) => (
            <div key={k} className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background: colors[i % colors.length].replace('oklch', '#888')}}></span>{k} ({v})</div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
      </div>
    );
  }

  // Line/bar chart for trends
  function ScholarsTrendsChart() {
    const maxVal = Math.max(...trendsJoined, ...trendsCompleted, 1);
    return (
      <div className="w-full max-w-2xl">
        <div className="flex gap-2 text-xs mb-1">
          <span className="w-16">Year</span>
          <span className="flex-1 text-center">Joined</span>
          <span className="flex-1 text-center">Completed</span>
        </div>
        {trendsYears.map((y, i) => (
          <div key={y} className="flex items-center gap-2 mb-1">
            <span className="w-16 font-mono">{y}</span>
            <div className="flex-1 h-4 bg-blue-100 rounded relative">
              <div className="absolute left-0 top-0 h-4 bg-blue-500 rounded-l" style={{ width: `${(trendsJoined[i] / maxVal) * 100}%` }} />
              <span className="absolute left-2 top-0 text-xs text-white">{trendsJoined[i]}</span>
            </div>
            <div className="flex-1 h-4 bg-green-100 rounded relative">
              <div className="absolute left-0 top-0 h-4 bg-green-500 rounded-l" style={{ width: `${(trendsCompleted[i] / maxVal) * 100}%` }} />
              <span className="absolute left-2 top-0 text-xs text-white">{trendsCompleted[i]}</span>
            </div>
          </div>
        ))}
        <div className="flex gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>Joined</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Completed</div>
        </div>
      </div>
    );
  }

  // PDF Export Handler
  async function handleExportPDF() {
    try {
      const reportElement = document.getElementById("consolidation-report-export");
      if (!reportElement) throw new Error("Report element not found");
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      pdf.save("consolidation_report.pdf");
    } catch (err) {
      if (err && err.message && err.message.includes('oklch')) {
        if (window.confirm("PDF export failed due to unsupported color (oklch). Would you like to export a text-based PDF instead?")) {
          exportTextPDF();
        }
      } else {
        alert("PDF export failed: " + (err.message || err));
      }
    }
  }

  // Fallback: Text-based PDF export
  function exportTextPDF() {
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    let y = 40;
    // Heading (logos removed to avoid PNG errors)
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text("College of Engineering Guindy, Anna University", pdf.internal.pageSize.getWidth() / 2, y + 30, { align: 'center' });
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'normal');
    pdf.text("Department of Computer Science and Engineering", pdf.internal.pageSize.getWidth() / 2, y + 55, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Academic Year: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, pdf.internal.pageSize.getWidth() / 2, y + 75, { align: 'center' });
    y += 90;
    pdf.setLineWidth(1);
    pdf.line(40, y, pdf.internal.pageSize.getWidth() - 40, y);
    y += 20;
    // Scholar Analytics & Breakdown
    pdf.setFontSize(15);
    pdf.setFont(undefined, 'bold');
    pdf.text("Scholar Analytics & Breakdown", 40, y);
    y += 18;
    // By Area of Research (Table)
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text("By Area of Research", 40, y);
    y += 20;
    pdf.setFont(undefined, 'normal');
    autoTable(pdf, {
      startY: y,
      head: [["Area", "Count"]],
      body: Object.entries(scholarsByArea).map(([area, count]) => [area, count]),
      theme: 'grid',
      styles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
      tableWidth: 250,
    });
    y = pdf.lastAutoTable.finalY + 40;
    // By Supervisor (Table)
    pdf.setFont(undefined, 'bold');
    pdf.text("By Supervisor", 40, y);
    y += 20;
    pdf.setFont(undefined, 'normal');
    autoTable(pdf, {
      startY: y,
      head: [["Supervisor", "Count"]],
      body: Object.entries(scholarsBySupervisor).map(([sup, count]) => [sup, count]),
      theme: 'grid',
      styles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
      tableWidth: 250,
    });
    y = pdf.lastAutoTable.finalY + 40;
    // By Scholar Status (Table)
    pdf.setFont(undefined, 'bold');
    pdf.text("By Scholar Status", 40, y);
    y += 20;
    pdf.setFont(undefined, 'normal');
    autoTable(pdf, {
      startY: y,
      head: [["Status", "Count"]],
      body: [
        ["Current", scholarStatusCounts.Current],
        ["Completed", scholarStatusCounts.Completed],
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
      tableWidth: 150,
    });
    y = pdf.lastAutoTable.finalY + 40;
    // By Year of Joining/Completion (Table)
    pdf.setFont(undefined, 'bold');
    pdf.text("By Year of Joining / Completion", 40, y);
    y += 20;
    pdf.setFont(undefined, 'normal');
    autoTable(pdf, {
      startY: y,
      head: [["Year", "Joined", "Completed"]],
      body: Array.from(new Set([...Object.keys(scholarsByJoiningYear), ...Object.keys(scholarsByCompletionYear)])).sort().map(year => [year, scholarsByJoiningYear[year] || 0, scholarsByCompletionYear[year] || 0]),
      theme: 'grid',
      styles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
      tableWidth: 250,
    });
    y = pdf.lastAutoTable.finalY + 40;
    // Advanced Analytics
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(15);
    pdf.text("Advanced Analytics", 40, y);
    y += 18;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Average Duration to Completion: ${avgDurationYears}y ${avgDurationRemMonths}m`, 40, y);
    y += 16;
    pdf.setFont(undefined, 'bold');
    pdf.text("Supervisor Load", 40, y);
    y += 20;
    pdf.setFont(undefined, 'normal');
    autoTable(pdf, {
      startY: y,
      head: [["Supervisor", "Count"]],
      body: supervisorLoadEntries.map(([sup, count]) => [sup, count]),
      theme: 'grid',
      styles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
      tableWidth: 250,
    });
    y = pdf.lastAutoTable.finalY + 40;
    // Visualizations (Trends Table)
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(15);
    pdf.text("Trends (Joined/Completed per Year)", 40, y);
    y += 20;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    autoTable(pdf, {
      startY: y,
      head: [["Year", "Joined", "Completed"]],
      body: trendsYears.map((year, i) => [year, trendsJoined[i], trendsCompleted[i]]),
      theme: 'grid',
      styles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
      tableWidth: 250,
    });
    pdf.save("consolidation_report_text.pdf");
  }

  return (
    <div className="p-4 md:p-10 space-y-10">
      {/* Hidden test div for PDF troubleshooting */}
      <div id="pdf-test-div" style={{display: 'none'}}>PDF Export Test: If you see this in your PDF, export is working.</div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPDF}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition font-semibold"
        >
          Export as PDF
        </button>
      </div>
      <div id="consolidation-report-export">
        <h1 className="text-3xl font-bold mb-6">Scholars Detailed Lists</h1>
        {/* Scholar Analytics & Breakdown */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold mb-4">Scholar Analytics & Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* By Area of Research (Bar) */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col">
              <h3 className="font-semibold mb-2 text-lg">By Area of Research</h3>
              <HorizontalBarChart data={scholarsByArea} color="#6366f1" label="Area" showAll={showAllAreas} setShowAll={setShowAllAreas} />
            </div>
            {/* By Supervisor (Bar) */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col">
              <h3 className="font-semibold mb-2 text-lg">By Supervisor</h3>
              <HorizontalBarChart data={scholarsBySupervisor} color="#f59e42" label="Supervisor" showAll={showAllSupervisors} setShowAll={setShowAllSupervisors} />
            </div>
            {/* By Scholar Status (Pie + Table) */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center col-span-1 md:col-span-2 xl:col-span-1">
              <h3 className="font-semibold mb-2 text-lg">By Scholar Status</h3>
              <ScholarStatusPie />
              <table className="text-sm w-full mt-2">
                <thead><tr><th className="px-2 py-1">Status</th><th className="px-2 py-1">Count</th></tr></thead>
                <tbody>
                  <tr><td className="px-2 py-1">Current</td><td className="px-2 py-1">{scholarStatusCounts.Current}</td></tr>
                  <tr><td className="px-2 py-1">Completed</td><td className="px-2 py-1">{scholarStatusCounts.Completed}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* By Year of Joining/Completion (Stacked Bar Chart) */}
          <div className="bg-white rounded-xl shadow p-5 flex flex-col">
            <h3 className="font-semibold mb-2 text-lg">By Year of Joining / Completion</h3>
            <ScholarsStackedBarChart />
          </div>
        </section>
        {/* Advanced Analytics */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold mb-4">Advanced Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Average Duration */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center justify-center">
              <h3 className="font-semibold mb-2 text-lg">Average Duration to Completion</h3>
              <div className="text-4xl font-bold text-blue-700">{avgDurationYears}y {avgDurationRemMonths}m</div>
              <div className="text-xs text-gray-500 mt-1">(From joining to completion, among completed scholars)</div>
            </div>
            {/* Supervisor Load */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col">
              <h3 className="font-semibold mb-2 text-lg">Supervisor Load</h3>
              <div className="space-y-1">
                {supervisorLoadEntries.map(([sup, count]) => (
                  <div key={sup} className="flex items-center gap-2">
                    <span className="w-32 truncate text-xs font-medium">{sup}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded relative">
                      <div className={`absolute left-0 top-0 h-4 rounded ${count === maxLoad ? 'bg-green-500' : count === minLoad ? 'bg-red-400' : 'bg-blue-400'}`} style={{ width: `${(count / maxLoad) * 100}%` }} />
                      <span className="absolute left-2 top-0 text-xs text-white font-bold">{count}</span>
                    </div>
                    {count === maxLoad && <span className="text-green-700 text-xs font-bold ml-2">High</span>}
                    {count === minLoad && <span className="text-red-700 text-xs font-bold ml-2">Low</span>}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">(Number of scholars per supervisor)</div>
            </div>
          </div>
        </section>
        {/* Visualizations Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold mb-4">Visualizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Trends: Line/Bar Chart */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center col-span-1 md:col-span-2 xl:col-span-2">
              <h3 className="font-semibold mb-2 text-lg">Scholars Joined/Completed per Year</h3>
              <ScholarsTrendsChart />
            </div>
            {/* Distribution: Pie/Donut Charts */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
              <h3 className="font-semibold mb-2 text-lg">Distribution by Area of Research</h3>
              <PieChart data={scholarsByArea} colors={["#6366f1", "#f59e42", "#60a5fa", "#a3e635", "#fbbf24", "#f472b6"]} label="Area of Research" />
            </div>
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
              <h3 className="font-semibold mb-2 text-lg">Distribution by Supervisor</h3>
              <PieChart data={scholarsBySupervisor} colors={["#f59e42", "#6366f1", "#34d399", "#f87171", "#fbbf24", "#60a5fa"]} label="Supervisor" />
            </div>
            <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
              <h3 className="font-semibold mb-2 text-lg">Distribution by Status</h3>
              <PieChart data={scholarStatusCounts} colors={["#60a5fa", "#a3e635"]} label="Status" />
            </div>
          </div>
        </section>
        {/* Current Scholars */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Current Scholars</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Area</th>
                  <th className="px-3 py-2 text-left">Supervisor</th>
                  <th className="px-3 py-2 text-left">Joining Date</th>
                  <th className="px-3 py-2 text-left">Expected Completion</th>
                </tr>
              </thead>
              <tbody>
                {currentScholarsList.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">No current scholars found.</td></tr>
                ) : (
                  currentScholarsList.map(s => (
                    <tr key={s._id} className="border-b hover:bg-blue-50">
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2">{s.areaOfResearch || '-'}</td>
                      <td className="px-3 py-2">{s.supervisor?.name || '-'}</td>
                      <td className="px-3 py-2">{formatDate(s.dateOfJoining)}</td>
                      <td className="px-3 py-2">{formatDate(s.dateOfCompletion)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        {/* Completed Scholars */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Completed Scholars</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Area</th>
                  <th className="px-3 py-2 text-left">Supervisor</th>
                  <th className="px-3 py-2 text-left">Joining Date</th>
                  <th className="px-3 py-2 text-left">Completion Date</th>
                </tr>
              </thead>
              <tbody>
                {completedScholarsList.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">No completed scholars found.</td></tr>
                ) : (
                  completedScholarsList.map(s => (
                    <tr key={s._id} className="border-b hover:bg-green-50">
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2">{s.areaOfResearch || '-'}</td>
                      <td className="px-3 py-2">{s.supervisor?.name || '-'}</td>
                      <td className="px-3 py-2">{formatDate(s.dateOfJoining)}</td>
                      <td className="px-3 py-2">{formatDate(s.dateOfCompletion)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        {/* Scholars Nearing Completion */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Scholars Nearing Completion (Next 6 Months)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Area</th>
                  <th className="px-3 py-2 text-left">Supervisor</th>
                  <th className="px-3 py-2 text-left">Joining Date</th>
                  <th className="px-3 py-2 text-left">Expected Completion</th>
                </tr>
              </thead>
              <tbody>
                {nearingCompletionList.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">No scholars nearing completion.</td></tr>
                ) : (
                  nearingCompletionList.map(s => (
                    <tr key={s._id} className="border-b hover:bg-yellow-50">
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2">{s.areaOfResearch || '-'}</td>
                      <td className="px-3 py-2">{s.supervisor?.name || '-'}</td>
                      <td className="px-3 py-2">{formatDate(s.dateOfJoining)}</td>
                      <td className="px-3 py-2">{formatDate(s.dateOfCompletion)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
} 