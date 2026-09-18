import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: "", date: new Date().toISOString().slice(0, 10), status: "PRESENT", notes: "" });

  const load = () => api.get("/attendance").then((r) => setRecords(r.data.data)).catch(() => {});
  useEffect(() => {
    load();
    api.get("/users").then((r) => setUsers(r.data.data)).catch(() => {});
  }, []);

  const handleMark = async (e) => {
    e.preventDefault();
    if (!form.userId) return toast.error("Select a staff member");
    try {
      await api.post("/attendance", form);
      toast.success("Attendance recorded");
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to mark attendance"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink-900">Attendance</h1>
      <form onSubmit={handleMark} className="card grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
        <select className="input" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
          <option value="">Staff member...</option>
          {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HALF_DAY">Half day</option>
          <option value="LEAVE">Leave</option>
        </select>
        <input className="input" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn-primary">Mark</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-ink-500 border-b border-gray-100"><th className="py-2">Staff</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-b border-gray-50">
                <td className="py-2">{r.user?.name}</td><td>{new Date(r.date).toLocaleDateString()}</td><td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
