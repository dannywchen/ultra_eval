import { getSupabase } from './supabase';

export async function uploadFile(file: File, bucket = 'assets') {
    const supabase = getSupabase();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Ensure the bucket exists (this might fail if already exists or no permission, but we try)
    // In production, the bucket should be created manually in Supabase dashboard.

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) {
        console.error('Upload error:', error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
}
