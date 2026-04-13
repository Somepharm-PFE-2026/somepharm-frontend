"use client";
import { useState } from "react";
import { 
  FileText, 
  FileBadge, 
  ScrollText, 
  Download, 
  CheckCircle2, 
  Loader2,
  Landmark,
  PlaneTakeoff,
  Scale
} from "lucide-react";

export default function DocumentsPage() {
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [successDoc, setSuccessDoc] = useState<string | null>(null);

  const downloadDocument = async (endpoint: string, filename: string, docType: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingDoc(docType);
    setSuccessDoc(null);

    try {
      const res = await fetch(`http://localhost:8080/api/documents/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        setSuccessDoc(docType);
        setTimeout(() => setSuccessDoc(null), 3000);
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoadingDoc(null);
    }
  };

  const documents = [
    {
      id: "attestation",
      title: "Attestation de Travail",
      description: "Document officiel certifiant votre emploi actuel chez Somepharm. Utile pour les démarches administratives standard.",
      icon: FileBadge,
      color: "bg-blue-600", lightColor: "bg-blue-50", textColor: "text-blue-600",
      endpoint: "attestation", filename: "Attestation_Travail.pdf", disabled: false
    },
    {
      id: "payslip",
      title: "Fiche de Paie",
      description: "Votre bulletin de salaire du mois en cours détaillant votre rémunération de base, vos primes et retenues (IRG, SS).",
      icon: ScrollText,
      color: "bg-amber-500", lightColor: "bg-amber-50", textColor: "text-amber-600",
      endpoint: "fiche-paie", filename: "Fiche_De_Paie.pdf", disabled: false
    },
    {
      id: "salaire",
      title: "Attestation de Salaire",
      description: "Document certifiant vos revenus nets. Strictement exigé pour les dossiers de crédit bancaire ou les demandes de Visa.",
      icon: Landmark,
      color: "bg-emerald-600", lightColor: "bg-emerald-50", textColor: "text-emerald-600",
      endpoint: "salaire", filename: "Attestation_Salaire.pdf", disabled: false
    },
    {
      id: "conge",
      title: "Titre de Congé",
      description: "Preuve officielle d'approbation de votre congé réglementaire. Indique votre solde actuel et l'autorisation de quitter le poste.",
      icon: PlaneTakeoff,
      color: "bg-purple-600", lightColor: "bg-purple-50", textColor: "text-purple-600",
      endpoint: "titre-conge", filename: "Titre_Conge.pdf", disabled: false
    },
    {
      id: "irg",
      title: "Relevé des Émoluments",
      description: "Bilan annuel de vos revenus et retenues fiscales. Nécessaire pour la déclaration annuelle d'impôts.",
      icon: FileText,
      color: "bg-gray-400", lightColor: "bg-gray-50", textColor: "text-gray-500",
      endpoint: "#", filename: "", disabled: true // Disabled for now (Placeholder)
    },
    {
      id: "reglement",
      title: "Règlement Intérieur",
      description: "Charte de l'entreprise, règles de sécurité, et politique interne de Somepharm.",
      icon: Scale,
      color: "bg-gray-400", lightColor: "bg-gray-50", textColor: "text-gray-500",
      endpoint: "#", filename: "", disabled: true // Disabled for now (Placeholder)
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-800 italic uppercase tracking-tighter">Documents Administratifs</h1>
        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2">Générez et téléchargez vos documents légaux validés par les RH</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {documents.map((doc) => (
          <div key={doc.id} className={`bg-white rounded-[2rem] border p-8 flex flex-col h-full transition-all duration-300 ${doc.disabled ? 'opacity-50 grayscale border-dashed' : 'hover:shadow-2xl hover:-translate-y-2 hover:border-gray-300'}`}>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`${doc.color} p-4 rounded-2xl text-white shadow-md`}>
                <doc.icon size={28} />
              </div>
              <h2 className="text-xl font-black text-gray-800 uppercase leading-tight">{doc.title}</h2>
            </div>

            <p className="text-sm text-gray-500 font-medium mb-8 flex-1">
              {doc.description}
            </p>

            <button
              onClick={() => !doc.disabled && downloadDocument(doc.endpoint, doc.filename, doc.id)}
              disabled={doc.disabled || loadingDoc === doc.id}
              className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all
                ${doc.disabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : successDoc === doc.id
                    ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                    : `${doc.lightColor} ${doc.textColor} hover:${doc.color} hover:text-white`
                }
              `}
            >
              {loadingDoc === doc.id ? (
                <><Loader2 size={18} className="animate-spin" /> Génération...</>
              ) : successDoc === doc.id ? (
                <><CheckCircle2 size={18} /> Téléchargé</>
              ) : doc.disabled ? (
                "Bientôt Disponible"
              ) : (
                <><Download size={18} /> Obtenir le PDF</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}