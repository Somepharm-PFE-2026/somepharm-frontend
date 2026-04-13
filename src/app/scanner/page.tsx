"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, ShieldCheck, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function ScannerPage() {
  const router = useRouter();
  const [tokenQr, setTokenQr] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });

  // Verification de sécurité simple
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
  }, [router]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenQr) return;
    
    setLoading(true);
    setResultat({ message: "", type: null });
    const jwt = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8080/api/sorties/scan/${tokenQr}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      
      const message = await res.text();
      
      if (res.ok) {
        setResultat({ message, type: "success" });
        setTokenQr(""); // Clear the input after success
      } else {
        setResultat({ message, type: "error" });
      }
    } catch (err) {
      setResultat({ message: "Erreur de connexion au serveur.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen font-sans flex flex-col items-center justify-center">
      
      {/* En-tête Agent de Sécurité */}
      <div className="mb-10 text-center">
        <div className="bg-gray-800 border border-gray-700 px-6 py-2 rounded-full inline-flex items-center gap-3 text-blue-400 font-bold mb-6">
          <ShieldCheck size={20} /> Interface Agent de Sécurité
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-widest">Contrôle d'Accès</h1>
        <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-xs">Terminal de Scan des Bons de Sortie</p>
      </div>

      {/* Interface du Scanner */}
      <div className="w-full max-w-md bg-gray-800 rounded-[2rem] border-2 border-gray-700 p-8 shadow-2xl">
        <form onSubmit={handleScan} className="space-y-6">
          
          {/* L'Animation "Scanner" */}
          <div className="relative h-48 bg-gray-900 rounded-3xl border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
             <div className="absolute top-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-[scan_2s_ease-in-out_infinite]"></div>
             <ScanLine size={64} className="text-gray-700" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">
              Code du Bon (Token QR)
            </label>
            <input
              type="text"
              value={tokenQr}
              onChange={(e) => setTokenQr(e.target.value)}
              placeholder="Collez le token ici..."
              className="w-full bg-gray-900 border-2 border-gray-700 p-4 rounded-xl text-center text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-900 hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {loading ? "Vérification..." : "Valider le Scan"}
          </button>
        </form>

        {/* Zone de Résultat */}
        {resultat.type && (
          <div className={`mt-6 p-4 rounded-xl border flex gap-3 font-bold text-sm ${
            resultat.type === "success" 
              ? "bg-green-900/30 border-green-800 text-green-400" 
              : "bg-red-900/30 border-red-800 text-red-400"
          }`}>
            {resultat.type === "success" ? <CheckCircle size={20} className="shrink-0" /> : <AlertTriangle size={20} className="shrink-0" />}
            <span>{resultat.message}</span>
          </div>
        )}
      </div>

      {/* Custom CSS for the scan line animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}