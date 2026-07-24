import { useState, useMemo } from "react";
import { evaluate } from "mathjs";

const tabs = ["Scientific", "Unit Converter", "GPA Calculator", "Percentage"];

export default function CalculatorHub() {
  const [tab, setTab] = useState("Scientific");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Calculator Hub</h1>
        <p className="text-slate-400 text-sm">Everyday student calculators, all client-side — no API needed.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              tab === t ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {tab === "Scientific" && <ScientificCalc />}
        {tab === "Unit Converter" && <UnitConverter />}
        {tab === "GPA Calculator" && <GPACalculator />}
        {tab === "Percentage" && <PercentageCalc />}
      </div>
    </div>
  );
}

function ScientificCalc() {
  const [expr, setExpr] = useState("");
  const result = useMemo(() => {
    if (!expr.trim()) return "";
    try {
      return String(evaluate(expr));
    } catch {
      return "Error";
    }
  }, [expr]);

  const buttons = ["7","8","9","/","(",")","4","5","6","*","^","sqrt(","1","2","3","-","log(","sin(","0",".","=","+","cos(","tan(","C"];

  const handleClick = (b) => {
    if (b === "C") return setExpr("");
    if (b === "=") return;
    setExpr((e) => e + b);
  };

  return (
    <div className="max-w-sm mx-auto">
      <input className="input text-right text-lg font-mono mb-3" value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="0" />
      <div className="text-right text-2xl font-semibold text-primary mb-4 h-8">{result}</div>
      <div className="grid grid-cols-5 gap-2">
        {buttons.map((b) => (
          <button key={b} onClick={() => handleClick(b)} className="btn-secondary py-3 text-sm">
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}

const unitGroups = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mile: 1609.34, ft: 0.3048, inch: 0.0254 },
  Weight: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495, ton: 1000 },
  Temperature: null, // special case
};

function UnitConverter() {
  const [group, setGroup] = useState("Length");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");
  const [value, setValue] = useState(1);

  const units = group === "Temperature" ? ["C", "F", "K"] : Object.keys(unitGroups[group]);

  const result = useMemo(() => {
    if (group === "Temperature") {
      const v = parseFloat(value);
      if (isNaN(v)) return "";
      let celsius = from === "C" ? v : from === "F" ? ((v - 32) * 5) / 9 : v - 273.15;
      if (to === "C") return celsius.toFixed(2);
      if (to === "F") return ((celsius * 9) / 5 + 32).toFixed(2);
      return (celsius + 273.15).toFixed(2);
    }
    const v = parseFloat(value);
    if (isNaN(v)) return "";
    const base = v * unitGroups[group][from];
    return (base / unitGroups[group][to]).toFixed(4);
  }, [group, from, to, value]);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <select className="input" value={group} onChange={(e) => { setGroup(e.target.value); setFrom("m"); setTo("km"); }}>
        {Object.keys(unitGroups).map((g) => <option key={g}>{g}</option>)}
      </select>
      <input type="number" className="input" value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="flex gap-3 items-center">
        <select className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
          {units.map((u) => <option key={u}>{u}</option>)}
        </select>
        <span className="text-slate-400">→</span>
        <select className="input" value={to} onChange={(e) => setTo(e.target.value)}>
          {units.map((u) => <option key={u}>{u}</option>)}
        </select>
      </div>
      <div className="text-2xl font-semibold text-primary">{result} {to}</div>
    </div>
  );
}

function GPACalculator() {
  const [courses, setCourses] = useState([{ grade: "A", credits: 3 }]);
  const points = { A: 4, "A-": 3.7, "B+": 3.3, B: 3, "B-": 2.7, "C+": 2.3, C: 2, D: 1, F: 0 };

  const gpa = useMemo(() => {
    const totalCredits = courses.reduce((s, c) => s + Number(c.credits || 0), 0);
    const totalPoints = courses.reduce((s, c) => s + (points[c.grade] || 0) * Number(c.credits || 0), 0);
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }, [courses]);

  const update = (i, key, val) => {
    const next = [...courses];
    next[i][key] = val;
    setCourses(next);
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {courses.map((c, i) => (
        <div key={i} className="flex gap-3">
          <select className="input" value={c.grade} onChange={(e) => update(i, "grade", e.target.value)}>
            {Object.keys(points).map((g) => <option key={g}>{g}</option>)}
          </select>
          <input type="number" className="input" value={c.credits} onChange={(e) => update(i, "credits", e.target.value)} placeholder="Credits" />
        </div>
      ))}
      <button className="btn-secondary text-sm" onClick={() => setCourses([...courses, { grade: "A", credits: 3 }])}>
        + Add course
      </button>
      <div className="text-2xl font-semibold text-primary">GPA: {gpa}</div>
    </div>
  );
}

function PercentageCalc() {
  const [value, setValue] = useState(50);
  const [total, setTotal] = useState(100);
  const percentage = total ? ((value / total) * 100).toFixed(2) : "0";

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Value</label>
        <input type="number" className="input" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Out of</label>
        <input type="number" className="input" value={total} onChange={(e) => setTotal(e.target.value)} />
      </div>
      <div className="text-2xl font-semibold text-primary">{percentage}%</div>
    </div>
  );
}
