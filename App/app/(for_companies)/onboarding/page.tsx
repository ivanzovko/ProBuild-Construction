"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import Step1PersonalInfo from "./steps/Step1PersonalInfo";
import Step2BusinessDetails from "./steps/Step2BusinessDetails";
import Step3ServicesReach from "./steps/Step3ServicesReach";
import Step4Verification from "./steps/Step4Verification";
import { 
  Building2, 
  Check, 
  X,
  Loader2
} from "lucide-react";
import { 
  STEPS, 
  COUNTIES, 
  CATEGORY_GROUPS, 
  COUNTRY_CODES, 
  getFlagUrl 
} from "../../../lib/onboarding-data";
import { useOnboardingData } from "./useOnboardingData";

export default function OnboardingPage() {
  const {
    workingHours, setWorkingHours, currentStep, setCurrentStep, loading, setLoading,
    errors, setErrors, searchQuery, setSearchQuery, countySearchQuery, setCountySearchQuery,
    activeGroup, setActiveGroup, uploadedFiles, setUploadedFiles, isSubmitModalOpen,
    setIsSubmitModalOpen, isSubmitting, setIsSubmitting, isSuccess, setIsSuccess,
    isError, setIsError, errorMessage, setErrorMessage, formData, setFormData,
    isPrefixOpen, setIsPrefixOpen, isCountyOpen, setIsCountyOpen, fileToDelete,
    prefixRef, countyRef, fileInputRef, handleFileChange, removeFile,
    confirmDelete, cancelDelete, nextStep, prevStep, toggleSelection,
    handleFinalSubmit, filteredCountries, filteredCounties, router, setFileToDelete
  } = useOnboardingData();

  // Popravljen useEffect niz zavisnosti sa Boolean cast-om za stabilnost
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep, Boolean(isSuccess), Boolean(isError)]);

  return (
    <main className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>

      {/* Success View sa omogucenim scroll-om za male ekrane */}
      {isSuccess ? (
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex items-center justify-center p-4 md:p-6 animate-in fade-in zoom-in duration-500">
          <div className="max-w-md w-full bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-12 shadow-xl border border-slate-100 text-center my-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg shadow-yellow-400/20 shrink-0">
              <Check size={32} className="text-slate-900 md:w-10 md:h-10" strokeWidth={3} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tight mb-4">
              Company <span className="text-yellow-500">Registered!</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed mb-8 md:mb-10">
              Your profile has been successfully created. Our team will verify your documents shortly.
            </p>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="w-full py-4 md:py-5 bg-slate-900 hover:bg-yellow-400 hover:text-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : isError ? (
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex items-center justify-center p-4 md:p-6 animate-in fade-in zoom-in duration-500">
          <div className="max-w-md w-full bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-12 shadow-xl border border-slate-100 text-center my-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shrink-0">
              <X size={32} className="text-red-500 md:w-10 md:h-10" strokeWidth={3} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tight mb-4">
              Submission <span className="text-red-500">Failed!</span>
            </h1>
            <p className="text-slate-500 text-sm mb-8 md:mb-10">{errorMessage || "An unexpected error occurred."}</p>
            <button 
              onClick={() => setIsError(false)} 
              className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
            >
              Try to Fix Data
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Progress Bar */}
          <div className="md:hidden fixed top-[3.5rem] left-0 z-[60] w-full bg-[#0F172A] border-b border-slate-800 shadow-xl">
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-400 font-black text-[11px] uppercase tracking-[0.2em]">Complete Setup</span>
                <span className="text-slate-500 font-bold text-[10px] uppercase">Step {currentStep}/4</span>
              </div>
              <div className="relative flex justify-between items-center px-2">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-800 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-0 h-[2px] bg-yellow-400 -translate-y-1/2 z-0 transition-all duration-500" 
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step}
                    className={`relative z-10 w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      step <= currentStep ? 'bg-yellow-400 ring-4 ring-yellow-400/20' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:flex w-full md:w-[380px] lg:w-[450px] bg-[#0F172A] p-6 md:p-8 flex-col border-r border-slate-800/50 shrink-0">
            <div className="flex flex-col items-start gap-4 mb-12">
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center">
                <Building2 className="text-slate-900" size={24} />
              </div>
              <div>
                <p className="text-yellow-500 font-black uppercase tracking-[0.3em] text-[10px] mb-1">Step {currentStep} of 4</p>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Complete <br /> Your Profile</h1>
              </div>
            </div>
            <div className="flex flex-col space-y-8">
              {STEPS?.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 
                      ${isActive ? 'bg-yellow-400 border-yellow-400 text-slate-900 scale-105 shadow-xl shadow-yellow-400/20' : isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-slate-800 text-slate-600'}`}
                    >
                      {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
                    </div>
                    <div className="hidden lg:block">
                      <p className={`text-[13px] font-black uppercase tracking-widest ${isActive ? 'text-yellow-400' : 'text-slate-500'}`}>{step.title}</p>
                      <p className={`text-[10px] font-medium ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 h-full bg-slate-50 flex justify-center items-start pt-24 md:pt-6 p-4 md:px-8 lg:px-12 overflow-y-auto custom-scrollbar">
            <div className={`w-full bg-white rounded-[24px] md:rounded-[32px] shadow-2xl p-5 md:p-10 border border-slate-100 flex flex-col mb-8 md:-mt-4 ${currentStep === 4 ? 'max-w-4xl' : 'max-w-lg'}`}>
              <div className="flex-1">
                {currentStep === 1 && <Step1PersonalInfo formData={formData} setFormData={setFormData} errors={errors} isPrefixOpen={isPrefixOpen} setIsPrefixOpen={setIsPrefixOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredCountries={filteredCountries} prefixRef={prefixRef} getFlagUrl={getFlagUrl} COUNTRY_CODES={COUNTRY_CODES} />}
                {currentStep === 2 && <Step2BusinessDetails formData={formData} setFormData={setFormData} errors={errors} isCountyOpen={isCountyOpen} setIsCountyOpen={setIsCountyOpen} countySearchQuery={countySearchQuery} setCountySearchQuery={setCountySearchQuery} filteredCounties={filteredCounties} countyRef={countyRef} />}
                {currentStep === 3 && <Step3ServicesReach formData={formData} errors={errors} activeGroup={activeGroup} setActiveGroup={setActiveGroup} CATEGORY_GROUPS={CATEGORY_GROUPS} toggleSelection={toggleSelection} isCountyOpen={isCountyOpen} setIsCountyOpen={setIsCountyOpen} countySearchQuery={countySearchQuery} setCountySearchQuery={setCountySearchQuery} filteredCounties={filteredCounties} COUNTIES={COUNTIES} countyRef={countyRef} />}
                {currentStep === 4 && <Step4Verification workingHours={workingHours} setWorkingHours={setWorkingHours} uploadedFiles={uploadedFiles} fileInputRef={fileInputRef} handleFileChange={handleFileChange} removeFile={removeFile} fileToDelete={fileToDelete} setFileToDelete={setFileToDelete} confirmDelete={confirmDelete} errors={errors} />}
              </div>

              <div className="flex gap-3 mt-8 md:mt-10">
                {currentStep > 1 && (
                  <button type="button" onClick={prevStep} className="flex-1 md:flex-none px-6 md:px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Back</button>
                )}
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="flex-[2] md:flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-yellow-400 hover:text-slate-900 transition-all"
                >
                  {currentStep === 4 ? "Complete Profile" : "Continue"}
                </button>
              </div>
            </div>
          </div>

          {/* Submission Modal */}
         {isSubmitModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsSubmitModalOpen(false)} />
    <div className="relative bg-white w-full max-w-md rounded-[32px] p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-400/20">
          <Check size={28} className="text-slate-900" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-2">Ready to <span className="text-yellow-500">Launch?</span></h3>
        <p className="text-slate-500 text-sm font-medium mb-8">Confirm your business details for verification.</p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button 
            type="button" 
            disabled={isSubmitting} 
            onClick={() => setIsSubmitModalOpen(false)} 
            className="order-2 sm:order-1 flex-1 px-6 py-4 bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:bg-slate-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            Back
          </button>
          
          <button 
            type="button" 
            disabled={isSubmitting} 
            onClick={handleFinalSubmit} 
            className="order-1 sm:order-2 flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 hover:bg-yellow-400 hover:text-slate-900 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/20 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
        </>
      )}
    </main>
  );
}