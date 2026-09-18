import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", gstNumber: "" });

  const load = () => api.get("/suppliers").then((r) => setSuppliers(r.data.data));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Supplier name is required");
    try {
      await api.post("/suppliers", form);
      toast.success("Supplier added");
      setForm({ name: "", phone: "", email: "", address: "", gstNumber: "" });
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to add supplier"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink-900">Suppliers</h1>
      <form onSubmit={handleAdd} className="card grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="GST Number" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
        <button className="btn-primary">Add Supplier</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-ink-500 border-b border-gray-100"><th className="py-2">Name</th><th>Phone</th><th>GST</th><th>Outstanding</th></tr></thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id} className="border-b border-gray-50">
                <td className="py-2">{s.name}</td><td>{s.phone}</td><td>{s.gstNumber}</td><td>₹{s.outstandingAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!suppliers.length && <div className="text-center text-ink-500 py-8">No suppliers yet</div>}
      </div>
    </div>
  );
}
