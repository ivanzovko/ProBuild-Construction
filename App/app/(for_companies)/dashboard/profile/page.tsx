"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Building2, Star, Edit3, Save, X, Loader2, 
  UploadCloud, CheckCircle2, AlertCircle, User, 
  Briefcase, Info, ShieldCheck, ChevronDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ReviewsModal from "@/app/find_service/components/reviewsModal";
import { Tooltip } from "@components/Tooltip";

import GeneralTab from "./components/GeneralTab";
import CategoriesTab from "./components/CategoriesTab";
import DetailsTab from "./components/DetailsTab";
import VerificationTab from "./components/VerificationTab";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [company, setCompany] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const [newCategory, setNewCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: <User size={14} /> },
    { id: 'categories', label: 'Categories & Area', icon: <Briefcase size={14} /> },
    { id: 'details', label: 'Details', icon: <Info size={14} /> },
    { id: 'verification', label: 'Verification', icon: <ShieldCheck size={14} /> }
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label;

  const defaultWorkingHours = [
    { day: "Monday", open: "08:00", close: "16:00", closed: false },
    { day: "Tuesday", open: "08:00", close: "16:00", closed: false },
    { day: "Wednesday", open: "08:00", close: "16:00", closed: false },
    { day: "Thursday", open: "08:00", close: "16:00", closed: false },
    { day: "Friday", open: "08:00", close: "16:00", closed: false },
    { day: "Saturday", open: "08:00", close: "16:00", closed: true },
    { day: "Sunday", open: "08:00", close: "16:00", closed: true },
  ];

  const InfoField = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) => (
    <div className="flex items-center gap-4 group transition-all duration-300">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-yellow-500 shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:rotate-3">
        {icon}
      </div>
      <div className="flex-1 overflow-hidden transition-transform duration-300 group-hover:translate-x-1">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="text-sm font-bold text-slate-900 truncate">{value || "Not set"}</div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchCompanyData();
  }, []);

  async function fetchCompanyData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || null);

      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      const processedData = {
        ...data,
        categories: Array.isArray(data.categories) ? data.categories : [],
        working_hours: Array.isArray(data.working_hours) ? data.working_hours : defaultWorkingHours,
        document_urls: Array.isArray(data.document_urls) ? data.document_urls : []
      };

      setCompany(processedData);
      setFormData(JSON.parse(JSON.stringify(processedData)));
      setPreviewUrl(data?.logo_url || null);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  async function handleSave() {
    if (!company?.id) return;
    setSaving(true);
    
    try {
      let finalLogoUrl = formData.logo_url;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${company.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('logo_company')
          .upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('logo_company').getPublicUrl(fileName);
        finalLogoUrl = publicUrl;
      }

      const { error } = await supabase
        .from("company_profiles")
        .update({
          company_name: formData.company_name,
          owner_full_name: formData.owner_full_name,
          address: formData.address,
          phone: formData.phone,
          base_county: formData.base_county,
          company_description: formData.company_description,
          iban: formData.iban,
          logo_url: finalLogoUrl,
          working_hours: formData.working_hours,
          categories: formData.categories, 
          service_counties: formData.service_counties
        })
        .eq("id", company.id);

      if (error) throw error;
      
      const updatedData = { ...formData, logo_url: finalLogoUrl };
      setCompany(JSON.parse(JSON.stringify(updatedData)));
      setFormData(JSON.parse(JSON.stringify(updatedData)));
      setSelectedFile(null);
      setIsEditing(false);
      setShowConfirmModal(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Error saving: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Download failed");
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto space-y-12">
        <div className="flex justify-between items-center animate-pulse">
          <div className="h-10 w-64 bg-slate-100 rounded-2xl" />
          <div className="h-12 w-32 bg-slate-100 rounded-2xl" />
        </div>
        <div className="flex gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-4 w-24 bg-slate-50 rounded-full" />)}
        </div>
        <div className="h-[400px] w-full bg-slate-50 rounded-[40px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-center gap-4">
        <h1 className="hidden sm:block text-3xl font-black text-slate-900 uppercase italic tracking-tight">
          {isEditing ? "Edit" : "Company"} <span className="text-yellow-500">Profile</span>
        </h1>
        
        <div className="flex flex-1 sm:flex-initial justify-end items-center gap-2 md:gap-3">
          <div className="sm:hidden flex-1 relative">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between gap-2 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm font-black text-[10px] uppercase tracking-widest text-slate-900 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2">
                {tabs.find(t => t.id === activeTab)?.icon}
                <span className="truncate">{activeTabLabel}</span>
              </div>
              <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMobileMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-[150] overflow-hidden animate-in zoom-in-95 duration-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'bg-yellow-400 text-black' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isEditing && (
            <Tooltip content="View Reviews">
              <button 
                onClick={() => setIsReviewsOpen(true)}
                className="flex items-center justify-center gap-2 bg-slate-50 text-slate-900 p-3 sm:px-4 sm:py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all border border-slate-100 shadow-sm min-w-[44px]"
              >
                <Star size={14} fill="currentColor" /> 
                <span className="font-bold">{Number(company?.average_rating || 0).toFixed(1)}</span>
                <span className="hidden sm:inline ml-1">Reviews</span>
              </button>
            </Tooltip>
          )}

          {isEditing ? (
            <div className="flex gap-2">
              <Tooltip content="Cancel Editing">
                <button 
                  onClick={() => { 
                    setIsEditing(false); 
                    setFormData(JSON.parse(JSON.stringify(company))); 
                    setPreviewUrl(company?.logo_url);
                    setSelectedFile(null);
                  }}
                  className="flex items-center justify-center gap-2 bg-white text-slate-400 p-3 sm:px-6 sm:py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 hover:scale-105 active:scale-95 transition-all border border-slate-100 shadow-sm min-w-[44px]"
                >
                  <X size={16} /> 
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </Tooltip>
              <Tooltip content="Save Changes">
                <button 
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white p-3 sm:px-6 sm:py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black hover:scale-105 active:scale-95 transition-all shadow-md min-w-[44px]"
                >
                  <Save size={16} /> 
                  <span className="hidden sm:inline">Save</span>
                </button>
              </Tooltip>
            </div>
          ) : (
            <Tooltip content="Edit Profile">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 bg-slate-900 text-white p-3 sm:px-6 sm:py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black hover:scale-105 active:scale-95 transition-all shadow-md min-w-[44px]"
              >
                <Edit3 size={16} /> 
                <span className="hidden sm:inline">Edit</span>
              </button>
            </Tooltip>
          )}
        </div>
      </header>

      <div className="hidden sm:flex border-b border-slate-100 gap-8 overflow-x-auto no-scrollbar py-2 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-4 border-b-2 transition-all duration-300 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap hover:scale-105 active:scale-95 origin-center ${
              activeTab === tab.id 
                ? 'border-yellow-500 text-slate-900' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'general' && (
          <GeneralTab 
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
            company={company}
            userEmail={userEmail}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
            setSelectedFile={setSelectedFile}
            fileInputRef={fileInputRef}
            InfoField={InfoField}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesTab 
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
            company={company}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            InfoField={InfoField}
          />
        )}

        {activeTab === 'details' && (
          <DetailsTab 
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
            company={company}
          />
        )}

        {activeTab === 'verification' && (
          <VerificationTab 
            company={company}
            handleDownload={handleDownload}
            InfoField={InfoField}
          />
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center scale-in-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertCircle size={32} /></div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-2">Save Changes?</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">This will update your profile.</p>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all hover:scale-105"
              >
                No
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                {saving ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReviewsModal 
        isOpen={isReviewsOpen} 
        onClose={() => setIsReviewsOpen(false)} 
        contractorId={company?.id} 
        contractorName={company?.company_name || "Company"} 
        supabase={supabase} 
      />
    </div>
  );
}