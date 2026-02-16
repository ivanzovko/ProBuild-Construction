"use client";

import { useState } from "react";
import { X, MapPin, AlignLeft, Type, Plus, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface DetailsProps {
  onClose: () => void;
  onSubmit: (data: { title: string; location: string; description: string }) => void;
  projectData: {
    project_type: string;
    sqm: number;
    quality: string;
    estimated_price: number;
  };
}

export default function CreateJobDetails({ onClose, onSubmit, projectData }: DetailsProps) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("Starting submission...");
    console.log("Form Data:", formData);
    console.log("Project Data from Props:", projectData);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session Error:", sessionError);
      }

      if (!session) {
        console.error("No active session found. User might not be logged in correctly.");
        return;
      }

      console.log("User authenticated. ID:", session.user.id);

      const { data, error } = await supabase
        .from("jobs")
        .insert([
          {
            title: formData.title,
            location: formData.location,
            description: formData.description,
            client_id: session.user.id,
            project_type: projectData.project_type,
            sqm: projectData.sqm,
            quality: projectData.quality,
            estimated_price: projectData.estimated_price,
            status: "pending"
          }
        ])
        .select();

      if (error) {
        console.error("Supabase Insert Error:", error);
        console.error("Error Message:", error.message);
        console.error("Error Details:", error.details);
        throw error;
      }

      console.log("Insert successful! Data returned:", data);
      onSubmit(formData);
    } catch (error) {
      console.error("Catch block error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-300">
        
        <div className="pt-10 pb-6 text-center">
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full" />
            <div className="relative w-14 h-14 bg-slate-900 text-yellow-400 rounded-2xl flex items-center justify-center shadow-lg -rotate-3">
              {isSubmitting ? <Loader2 className="animate-spin" size={28} /> : <Plus size={28} />}
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Project Details</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tell us more about your project</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-4">
          <div className="relative group">
            <div className="absolute left-5 top-4.5 text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <Type size={16} className="mt-1" />
            </div>
            <input
              required
              disabled={isSubmitting}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="JOB TITLE (E.G. APARTMENT RENOVATION)"
              className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 transition-all disabled:opacity-50"
            />
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-4.5 text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <MapPin size={16} className="mt-1" />
            </div>
            <input
              required
              disabled={isSubmitting}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="LOCATION (E.G. SPLIT, CROATIA)"
              className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 transition-all disabled:opacity-50"
            />
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <AlignLeft size={16} />
            </div>
            <textarea
              required
              disabled={isSubmitting}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="DESCRIBE WHAT NEEDS TO BE DONE..."
              className="w-full bg-slate-50 border-2 border-slate-900 rounded-[24px] py-4 pl-14 pr-6 text-[10px] font-black uppercase placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 transition-all min-h-[100px] resize-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:bg-slate-400"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : "Publish"}
          </button>
        </form>

        <button 
          onClick={onClose} 
          disabled={isSubmitting}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}