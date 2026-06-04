export const uploadImage = async (file: File) => {
  // In a real app this would post to a real endpoint or S3 bucket
  // For the frontend-ready mock, we'll just fake it with a placeholder
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(URL.createObjectURL(file));
    }, 1000);
  });
};

export const createPostApi = async (payload: any) => {
  if (payload.image instanceof File) {
    const url = await uploadImage(payload.image);
    payload.image = url;
  }

  // Mock API delay
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      // TODO: Replace with actual backend API call
      resolve();
    }, 500);
  });
};
