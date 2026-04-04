"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Users, UserPlus, Shield, X, Edit, Lock, Unlock, KeyRound, Copy, Check, Building2, FileDown } from "lucide-react";

export default function EmployesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState([]);
  const [token, setToken] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ matricule: "", email: "", password: "", roleId: 1, departement: "IT & Tech" });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const departments = ["IT & Tech", "Ressources Humaines", "Finance", "Logistique", "Commercial", "Général"];

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) return router.push("/login");

    try {
      setToken(savedToken);
      const decoded: any = jwtDecode(savedToken);
      if (decoded.role !== "HR_ADMIN") return router.push("/demandes");
      
      setUser(decoded);
      fetchEmployees(savedToken);
    } catch (err) { router.push("/login"); }
  }, [router]);

  const fetchEmployees = async (t: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/utilisateurs/all", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) setEmployees(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...newEmployee, statutCompte: "ACTIF", role: { idRole: newEmployee.roleId } };
    try {
      const res = await fetch("http://localhost:8080/api/utilisateurs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewEmployee({ matricule: "", email: "", password: "", roleId: 1, departement: "IT & Tech" });
        fetchEmployees(token);
      }
    } catch (err) { console.error(err); }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
        email: editingEmployee.email, 
        role: { idRole: editingEmployee.roleId }, 
        soldeConges: editingEmployee.soldeConges,
        departement: editingEmployee.departement 
    };
    try {
      const res = await fetch(`http://localhost:8080/api/utilisateurs/${editingEmployee.idUser}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        closeEditModal();
        fetchEmployees(token);
      }
    } catch (err) { console.error(err); }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/utilisateurs/${id}/statut`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) fetchEmployees(token);
    } catch (err) { console.error(err); }
  };

  const handleResetPassword = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/utilisateurs/${id}/reset-password`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedPassword(data.tempPassword); 
      }
    } catch (err) { console.error(err); }
  };

  const copyToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // 🚀 NEW: Magic Export to CSV Function
  const exportToCSV = () => {
    // 1. Set the headers for Excel
    const headers = ["Matricule", "Email", "Role", "Departement", "Statut", "Solde Conges"];

    // 2. Map the React state into raw data rows
    const csvData = employees.map((emp: any) => [
      emp.matricule,
      emp.email,
      emp.role?.nomRole || "EMPLOYEE",
      emp.departement || "Général",
      emp.statutCompte || "ACTIF",
      emp.soldeConges
    ]);

    // 3. Join everything with commas
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    // 4. Create a downloadable file and force the browser to click it
    // The \uFEFF is a BOM marker that ensures Excel reads French accents properly!
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Name the file dynamically with today's date
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Somepharm_Employes_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee({ 
      idUser: emp.idUser, 
      matricule: emp.matricule, 
      email: emp.email, 
      roleId: emp.role?.idRole || 1,
      soldeConges: emp.soldeConges,
      departement: emp.departement || "Général" 
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setGeneratedPassword(null); 
    setIsCopied(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-gray-800 italic uppercase tracking-tighter">Gestion du Personnel</h1>
        <div className="bg-white shadow-sm border px-6 py-2 rounded-2xl font-bold text-blue-600 flex items-center gap-2">
          <Shield size={18} /> {user?.sub} (ADMIN RH)
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border">
        <div className="p-8 bg-gray-50/50 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md"><Users size={24} /></div>
            <h2 className="text-2xl font-black text-gray-700 italic uppercase">Annuaire Somepharm</h2>
          </div>
          
          {/* 🚀 NEW: We wrapped the buttons in a flex container to put them side by side */}
          <div className="flex gap-4">
            <button onClick={exportToCSV} className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-black shadow-sm hover:bg-gray-50 transition flex items-center gap-2">
              <FileDown size={20} className="text-gray-500" /> EXPORTER (CSV)
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition flex items-center gap-2">
              <UserPlus size={20} /> NOUVEL EMPLOYÉ
            </button>
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase font-black border-b">
            <tr>
              <th className="p-8">Matricule</th>
              <th className="p-8">Profil & Département</th>
              <th className="p-8">Statut</th>
              <th className="p-8 text-center">Solde</th>
              <th className="p-8 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((emp: any) => (
              <tr key={emp.idUser} className={`transition-colors ${emp.statutCompte === 'INACTIF' ? 'bg-gray-50 opacity-60' : 'hover:bg-blue-50/30'}`}>
                <td className="p-8 font-black text-gray-900">{emp.matricule}</td>
                <td className="p-8">
                  <p className="text-sm font-bold text-gray-600 mb-2">{emp.email}</p>
                  <div className="flex gap-2 items-center">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                      emp.role?.idRole === 3 ? 'bg-purple-100 text-purple-700' :
                      emp.role?.idRole === 2 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {emp.role?.nomRole || "EMPLOYEE"}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                      <Building2 size={10} /> {emp.departement || "Général"}
                    </span>
                  </div>
                </td>
                <td className="p-8">
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    emp.statutCompte === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {emp.statutCompte || "ACTIF"}
                  </span>
                </td>
                <td className="p-8 text-center">
                  <span className="text-2xl font-black text-gray-800">{emp.soldeConges}</span>
                  <span className="text-xs font-bold text-gray-400 ml-1">Jours</span>
                </td>
                <td className="p-8">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => openEditModal(emp)} className="bg-gray-100 text-gray-600 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm" title="Modifier">
                      <Edit size={16} />
                    </button>
                    {user?.sub !== emp.matricule && (
                      <button onClick={() => handleToggleStatus(emp.idUser)} className={`p-3 rounded-xl transition shadow-sm ${
                        emp.statutCompte === 'ACTIF' ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                      }`} title={emp.statutCompte === 'ACTIF' ? "Suspendre" : "Réactiver"}>
                        {emp.statutCompte === 'ACTIF' ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- CREATE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
              <div><h3 className="font-black uppercase text-xl italic">Intégrer un employé</h3></div>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateEmployee} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Matricule</label>
                <input required type="text" className="w-full bg-gray-50 border-2 rounded-2xl p-4 font-bold text-gray-700" value={newEmployee.matricule} onChange={(e) => setNewEmployee({...newEmployee, matricule: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Professionnel</label>
                <input required type="email" className="w-full bg-gray-50 border-2 rounded-2xl p-4 font-bold text-gray-700" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mot de passe</label>
                <input required type="text" className="w-full bg-gray-50 border-2 rounded-2xl p-4 font-bold text-gray-700" value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Niveau d'accès</label>
                <select className="w-full bg-gray-50 border-2 rounded-2xl p-4 font-bold text-gray-700" value={newEmployee.roleId} onChange={(e) => setNewEmployee({...newEmployee, roleId: Number(e.target.value)})}>
                  <option value={1}>Employé</option><option value={2}>Manager</option><option value={3}>Admin RH</option>
                </select></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Département</label>
                <select className="w-full bg-gray-50 border-2 rounded-2xl p-4 font-bold text-gray-700" value={newEmployee.departement} onChange={(e) => setNewEmployee({...newEmployee, departement: e.target.value})}>
                  {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select></div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-sm shadow-lg hover:bg-blue-700">Créer le Profil</button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && editingEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-gray-800 p-8 text-white flex justify-between items-center">
              <div><h3 className="font-black uppercase text-xl italic">Modifier {editingEmployee.matricule}</h3></div>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="p-8 pb-4 border-b border-gray-100">
              {!generatedPassword ? (
                <button type="button" onClick={() => handleResetPassword(editingEmployee.idUser)} className="w-full bg-amber-50 text-amber-600 border-2 border-amber-100 p-4 rounded-2xl font-black uppercase text-xs hover:bg-amber-500 hover:text-white transition flex justify-center items-center gap-2">
                  <KeyRound size={16} /> Générer Mot de Passe Provisoire
                </button>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-2xl flex justify-between items-center animate-in fade-in duration-300">
                  <div>
                    <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Nouveau Mot de Passe</p>
                    <p className="font-mono text-xl font-bold text-green-900 tracking-wider">{generatedPassword}</p>
                  </div>
                  <button type="button" onClick={copyToClipboard} className={`p-3 rounded-xl transition shadow-sm text-white ${isCopied ? 'bg-green-500' : 'bg-gray-800 hover:bg-gray-900'}`}>
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleEditEmployee} className="p-8 pt-4 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nouvel Email</label>
                <input required type="email" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none" 
                  value={editingEmployee.email} onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rôle</label>
                  <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none" 
                    value={editingEmployee.roleId} onChange={(e) => setEditingEmployee({...editingEmployee, roleId: Number(e.target.value)})}>
                    <option value={1}>Employé</option><option value={2}>Manager</option><option value={3}>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Solde</label>
                  <input required type="number" min="0" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none" 
                    value={editingEmployee.soldeConges} onChange={(e) => setEditingEmployee({...editingEmployee, soldeConges: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Département</label>
                  <select className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none" 
                    value={editingEmployee.departement} onChange={(e) => setEditingEmployee({...editingEmployee, departement: e.target.value})}>
                    {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-gray-800 text-white p-4 rounded-2xl font-black uppercase text-sm shadow-lg hover:bg-gray-900 transition mt-4">
                Sauvegarder les modifications
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}