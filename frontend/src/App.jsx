import { useState } from "react";
import "./App.css";

const WORKCLASS_OPTIONS = [
  "Federal-gov", "Local-gov", "Never-worked", "Private",
  "Self-emp-inc", "Self-emp-not-inc", "State-gov", "Without-pay",
];

const MARITAL_OPTIONS = [
  "Divorced", "Married-AF-spouse", "Married-civ-spouse",
  "Married-spouse-absent", "Never-married", "Separated", "Widowed",
];

const OCCUPATION_OPTIONS = [
  "Adm-clerical", "Armed-Forces", "Craft-repair", "Exec-managerial",
  "Farming-fishing", "Handlers-cleaners", "Machine-op-inspct",
  "Other-service", "Priv-house-serv", "Prof-specialty",
  "Protective-serv", "Sales", "Tech-support", "Transport-moving",
];

const RELATIONSHIP_OPTIONS = [
  "Husband", "Not-in-family", "Other-relative", "Own-child",
  "Unmarried", "Wife",
];

const COUNTRY_OPTIONS = [
  "Cambodia", "Canada", "China", "Columbia", "Cuba",
  "Dominican-Republic", "Ecuador", "El-Salvador", "England", "France",
  "Germany", "Greece", "Guatemala", "Haiti", "Holand-Netherlands",
  "Honduras", "Hong", "Hungary", "India", "Iran", "Ireland", "Italy",
  "Jamaica", "Japan", "Laos", "Mexico", "Nicaragua",
  "Outlying-US(Guam-USVI-etc)", "Peru", "Philippines", "Poland",
  "Portugal", "Puerto-Rico", "Scotland", "South", "Taiwan", "Thailand",
  "Trinadad&Tobago", "United-States", "Vietnam", "Yugoslavia",
];

const INITIAL = {
  age: 35,
  workclass: "Private",
  "education-num": 10,
  "marital-status": "Never-married",
  occupation: "Prof-specialty",
  relationship: "Not-in-family",
  "capital-gain": 0,
  "capital-loss": 0,
  "hours-per-week": 40,
  "native-country": "United-States",
};

function SelectField({ label, name, options, value, onChange }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function NumberField({ label, name, value, onChange, min, max }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={onChange}
      />
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <p className="disclaimer">
        Practice project on 1994 census data. Not for real decisions about
        people.
      </p>

      <h1>Adult Income Predictor</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid">
          <NumberField label="Age" name="age" value={form.age} onChange={handleChange} min={17} max={90} />
          <SelectField label="Workclass" name="workclass" options={WORKCLASS_OPTIONS} value={form.workclass} onChange={handleChange} />
          <NumberField label="Education-Num" name="education-num" value={form["education-num"]} onChange={handleChange} min={1} max={16} />
          <SelectField label="Marital Status" name="marital-status" options={MARITAL_OPTIONS} value={form["marital-status"]} onChange={handleChange} />
          <SelectField label="Occupation" name="occupation" options={OCCUPATION_OPTIONS} value={form.occupation} onChange={handleChange} />
          <SelectField label="Relationship" name="relationship" options={RELATIONSHIP_OPTIONS} value={form.relationship} onChange={handleChange} />
          <NumberField label="Capital Gain" name="capital-gain" value={form["capital-gain"]} onChange={handleChange} min={0} max={99999} />
          <NumberField label="Capital Loss" name="capital-loss" value={form["capital-loss"]} onChange={handleChange} min={0} max={4356} />
          <NumberField label="Hours / Week" name="hours-per-week" value={form["hours-per-week"]} onChange={handleChange} min={1} max={99} />
          <SelectField label="Native Country" name="native-country" options={COUNTRY_OPTIONS} value={form["native-country"]} onChange={handleChange} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Predicting…" : "Predict"}
        </button>
      </form>

      {error && <div className="result error">⚠ {error}</div>}

      {result && (
        <div className={`result ${result.prediction === ">50K" ? "high" : "low"}`}>
          <p className="prediction">{result.prediction}</p>
          <p>Probability: <strong>{(result.probability * 100).toFixed(1)}%</strong></p>
          <p className="threshold">Threshold: {result.threshold}</p>
        </div>
      )}
    </div>
  );
}
