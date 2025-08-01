const cloudName = import.meta.env.VITE_CLOUD_NAME;
const cloudPresets = import.meta.env.VITE_CLOUD_PRESETS;

interface UploadResponse {
  secure_url: string;
  error?: string;
}

const uploadImage = async (file: File): Promise<UploadResponse> => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", cloudPresets); // seu preset aqui

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: data,
  });

  return await response.json();
};

export { uploadImage };
