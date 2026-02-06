import { supabase } from "@/lib/supabase";

// 1. Prihvaćanje ponude (Estimated -> Active)
export const acceptOffer = async (jobId: string, contractorId: string) => {
  // Update projekta na 'active' i dodjela izvođača
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ 
      status: 'active', 
      contractor_id: contractorId,
      progress: 0 
    })
    .eq('id', jobId);

  if (updateError) throw updateError;

  // Brisanje ostalih ponuda za taj posao (opcionalno, ili ih samo odbij)
  await supabase.from('offers').delete().eq('job_id', jobId).neq('contractor_id', contractorId);
};

// 2. Potvrda završetka i Rating (Active -> Completed)
export const completeProject = async (jobId: string, contractorId: string, rating: number) => {
  // Update projekta na 'completed' i spremanje ocjene
  await supabase
    .from('jobs')
    .update({ status: 'completed', client_rating: rating })
    .eq('id', jobId);

  // Update ratinga firme (ovo bi idealno bio Database RPC, ali može i ovako)
  // Prvo dohvati trenutne podatke firme
  const { data: profile } = await supabase
    .from('company_profiles')
    .select('rating_sum, jobs_completed_count')
    .eq('id', contractorId)
    .single();

  if (profile) {
    const newSum = (profile.rating_sum || 0) + rating;
    const newCount = (profile.jobs_completed_count || 0) + 1;
    
    await supabase
      .from('company_profiles')
      .update({ 
        rating_sum: newSum, 
        jobs_completed_count: newCount,
        average_rating: newSum / newCount
      })
      .eq('id', contractorId);
  }
};