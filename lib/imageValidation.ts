import type { ChangeEvent } from "react";
import { toast } from "sonner";

const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"];
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const getFileExtension = (fileName: string) =>
  fileName?.split?.(".")?.pop()?.toLowerCase() ?? "";

const isAllowedImageFile = (file: File) => {
  const extension = getFileExtension(file.name);
  const normalizedType = file.type?.toLowerCase();

  return (
    ALLOWED_IMAGE_EXTENSIONS.includes(extension) ||
    (!!normalizedType && ALLOWED_IMAGE_MIME_TYPES.includes(normalizedType))
  );
};

export const validateImageFileChange = (
  event: ChangeEvent<HTMLInputElement>,
  errorMessage = "Only JPG, JPEG, and PNG images are allowed."
) => {
  const files = event.target.files;
  if (!files?.length) {
    return true;
  }

  const isValid = Array.from(files).every(isAllowedImageFile);

  if (!isValid) {
    event.target.value = "";
    toast.error(errorMessage);
  }

  return isValid;
};

export const IMAGE_ACCEPT =
  ".jpg,.jpeg,.png,image/jpeg,image/png,image/jpg";

