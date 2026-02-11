import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { 
  STEPS, 
  COUNTIES, 
  COUNTRY_CODES, 
  INITIAL_WORKING_HOURS 
} from "../../../lib/onboarding-data";

export const useOnboardingData = () => {
  const [workingHours, setWorkingHours] = useState(INITIAL_WORKING_HOURS);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [countySearchQuery, setCountySearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("Construction");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPrefixOpen, setIsPrefixOpen] = useState(false);
  const [isCountyOpen, setIsCountyOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);

  const prefixRef = useRef<HTMLDivElement>(null);
  const countyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [formData, setFormData] = useState({
    owner_full_name: "", phone_prefix: "+385", phone_number: "",
    company_name: "", oib: "", iban: "", address: "", base_county: "",
    working_hours: { start: "08:00", end: "16:00" },
    service_counties: [] as string[], categories: [] as string[],
    logo_file: null as File | null,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (prefixRef.current && !prefixRef.current.contains(e.target as Node)) setIsPrefixOpen(false);
      if (countyRef.current && !countyRef.current.contains(e.target as Node)) setIsCountyOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => {
        const uniqueNewFiles = newFiles.filter(newFile => 
          !prev.some(existing => existing.name === newFile.name && existing.size === newFile.size)
        );
        if (uniqueNewFiles.length < newFiles.length) {
          setErrors(prev => ({ ...prev, files: "Same file are already uploaded" }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.files;
            return newErrors;
          });
        }
        return [...prev, ...uniqueNewFiles];
      });
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => setFileToDelete(index);
  const confirmDelete = () => {
    if (fileToDelete !== null) {
      setUploadedFiles(prev => prev.filter((_, i) => i !== fileToDelete));
      setFileToDelete(null);
    }
  };
  const cancelDelete = () => setFileToDelete(null);

  const validateStep = () => {
    let newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.logo_file) newErrors.logo_file = "Logo is required";
      if (!formData.owner_full_name.trim()) newErrors.owner_full_name = "Full name is required";
      if (!formData.phone_number.trim()) newErrors.phone_number = "Phone number is required";
    }
    if (currentStep === 2) {
      if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
      if (formData.oib.length !== 11) newErrors.oib = "PIN must be 11 digits";
      
    // Općeniti IBAN Regex: Počinje s 2 slova, slijedi 13 do 32 alfanumerička znaka
  const genericIbanRegex = /^[A-Z]{2}[0-9A-Z]{13,32}$/;

  if (!formData.iban) {
    newErrors.iban = "IBAN is required";
  } else if (!genericIbanRegex.test(formData.iban)) {
    newErrors.iban = "Invalid IBAN format";
  }

      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.base_county) newErrors.base_county = "HQ county required";
    }
    if (currentStep === 3) {
      if (formData.categories.length === 0) newErrors.categories = "Select one category";
      if (formData.service_counties.length === 0) newErrors.service_counties = "Select one county";
    }
    if (currentStep === 4) {
      if (uploadedFiles.length === 0) newErrors.files = "Upload required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep === 4) setIsSubmitModalOpen(true);
      else setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const toggleSelection = (item: string, field: "service_counties" | "categories") => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item]
    }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setIsError(false);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) throw new Error("Sesija istekla.");

      const user = session.user;
      
      let logoPublicUrl = "";
      if (formData.logo_file) {
        const logoExt = formData.logo_file.name.split('.').pop();
        const logoPath = `${user.id}/logo-${Date.now()}.${logoExt}`;
        const { error: logoError } = await supabase.storage.from('logo_company').upload(logoPath, formData.logo_file);
        if (logoError) throw new Error("Greška pri prijenosu logotipa.");
        const { data: { publicUrl } } = supabase.storage.from('logo_company').getPublicUrl(logoPath);
        logoPublicUrl = publicUrl;
      }

      const documentUrls = [];
      for (const file of uploadedFiles) {
        const cleanName = file.name.replace(/[^\w.-]/g, '_');
        const filePath = `${user.id}/${Date.now()}---${cleanName}`;
        
        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        if (uploadError) throw new Error("Greška pri prijenosu dokumenata.");
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
        documentUrls.push(publicUrl);
      }

      const { error: insertError } = await supabase.from('company_profiles').upsert({
        id: user.id,
        owner_full_name: formData.owner_full_name,
        company_name: formData.company_name,
        oib: formData.oib,
        iban: formData.iban,
        address: formData.address,
        phone: `${formData.phone_prefix}${formData.phone_number}`,
        working_hours: workingHours,
        base_county: formData.base_county,
        service_counties: formData.service_counties,
        categories: formData.categories,
        document_urls: documentUrls,
        logo_url: logoPublicUrl,
        is_onboarded: true,
        updated_at: new Date().toISOString()
      });

      if (insertError) throw insertError;
      setIsSubmitModalOpen(false);
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.message || "Greška");
      setIsSubmitModalOpen(false);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCountries = COUNTRY_CODES.filter(c => 
    c.label.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.includes(searchQuery)
  );
  
  const filteredCounties = COUNTIES.filter(c => 
    c.toLowerCase().includes(countySearchQuery.toLowerCase())
  );

  return {
    workingHours, setWorkingHours, currentStep, setCurrentStep, loading, setLoading,
    errors, setErrors, searchQuery, setSearchQuery, countySearchQuery, setCountySearchQuery,
    activeGroup, setActiveGroup, uploadedFiles, setUploadedFiles, isSubmitModalOpen,
    setIsSubmitModalOpen, isSubmitting, setIsSubmitting, isSuccess, setIsSuccess,
    isError, setIsError, errorMessage, setErrorMessage, formData, setFormData,
    isPrefixOpen, setIsPrefixOpen, isCountyOpen, setIsCountyOpen, fileToDelete,
    prefixRef, countyRef, fileInputRef, handleFileChange, removeFile,
    confirmDelete, cancelDelete, nextStep, prevStep, toggleSelection,
    handleFinalSubmit, filteredCountries, filteredCounties, router, 
    setFileToDelete,
  };
};