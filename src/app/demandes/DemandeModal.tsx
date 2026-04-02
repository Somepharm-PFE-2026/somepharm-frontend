"use client";
import { useState } from "react";

export default function DemandeModal({ isOpen, onClose, onSuccess, token }: any) {
  const [formData, setFormData] = useState({
    typeConge: "MALADIE",
    dateDebut: "",
    dateFin: "",
    motif: "Demande via portail",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.dateFin) < new Date(formData.dateDebut)) {
      alert("Erreur: La date de fin est avant la date de début !");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/demandes/submit", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        // 🚨 X-RAY VISION: This captures the exact Java error message!
        const errorText = await res.text();
        alert(`🚨 REJET DU SERVEUR (Code ${res.status}):\n\n${errorText}`);
        console.error("Erreur détaillée:", errorText);
      }
    } catch (err) { 
        console.error("Erreur réseau:", err); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-200">
        <h2 className="text-2xl font-black text-gray-800 mb-6 italic underline decoration-blue-500">Nouvelle Demande</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select className="w-full p-4 bg-gray-50 rounded-xl font-bold" value={formData.typeConge} onChange={(e) => setFormData({...formData, typeConge: e.target.value})}>
            <option value="MALADIE">Maladie</option>
            <option value="SANS_SOLDE">Sans Solde</option>
            <option value="CONGE_ANNUEL">Congé Annuel</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" required className="p-4 bg-gray-50 rounded-xl" onChange={(e) => setFormData({...formData, dateDebut: e.target.value})} />
            <input type="date" required className="p-4 bg-gray-50 rounded-xl" onChange={(e) => setFormData({...formData, dateFin: e.target.value})} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-400 font-bold">Annuler</button>
            <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg">Soumettre</button>
          </div>
        </form>
      </div>
    </div>
  );
}