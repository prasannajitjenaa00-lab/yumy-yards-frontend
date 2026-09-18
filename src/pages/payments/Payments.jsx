import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function Payments() {
  const [shift, setShift] = useState(null);
  const [openingCash, setOpeningCash] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [shifts, setShifts] = useState([]);

  const load = () => {
    api.get("/shifts/current").then((r) => setShift(r.data.data)).catch(() => {});
    api.get("/shifts").then((r) => setShifts(r.data.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openShift = async (e) => {
    e.preventDefault();
    try {
      await api.post("/shifts/open", { openingCash: Number(openingCash) });
      toast.success("Shift opened");
      setOpeningCash("");
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to open shift"); }
  };

  const closeShift = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/shifts/${shift._id}/close`, { actualCash: Number(actualCash) });
      toast.success("Shift closed");
      setActualCash("");
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to close shift"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink-900">Cashier Shift</h1>
      {!shift ? (
        <form onSubmit={openShift} className="card space-y-2 max-w-sm">
          <div className="text-sm font-semibold">Open Shift</div>
          <input className="input" type="number" placeholder="Opening cash (₹)" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} />
          <button className="btn-primary w-full">Open Shift</button>
        </form>
      ) : (
        <div className="card space-y-3 max-w-sm">
          <div className="text-sm font-semibold">Shift open since {new Date(shift.openingTime).toLocaleTimeString()}</div>
          <div className="text-sm text-ink-500">Opening cash: ₹{shift.openingCash}</div>
          <form onSubmit={closeShift} className="space-y-2">
            <input className="input" type="number" placeholder="Actual cash counted (₹)" value={actualCash} onChange={(e) => setActualCash(e.target.value)} />
            <button className="btn-danger w-full">Close Shift</button>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <div className="text-sm font-semibold mb-2">Shift History</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-ink-500 border-b border-gray-100"><th className="py-2">Cashier</th><th>Opened</th><th>Cash Sales</th><th>Expected</th><th>Actual</th><th>Diff</th><th>Status</th></tr></thead>
          <tbody>
            {shifts.map((s) => (
              <tr key={s._id} className="border-b border-gray-50">
                <td className="py-2">{s.cashier?.name}</td>
                <td>{new Date(s.openingTime).toLocaleDateString()}</td>
                <td>₹{s.cashSales}</td>
                <td>{s.expectedCash ?? "—"}</td>
                <td>{s.actualCash ?? "—"}</td>
                <td>{s.difference ?? "—"}</td>
                <td><span className={`badge ${s.status === "OPEN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
