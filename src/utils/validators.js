import { checkExistsEmail } from "@/services/authService";
import { addMethod, object, ref, string } from "yup";

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Tùy biến phương thức email cho Yup string validator
addMethod(string, "email", function (message) {
  return this.matches(EMAIL_REGEX, {
    message,
    name: "email",
    excludeEmptyString: true,
  });
});

const emailCache = new Map();

export const checkEmailAvailability = async (email) => {
  if (!email || !EMAIL_REGEX.test(email)) {
    return true;
  }
  if (emailCache.has(email)) {
    return emailCache.get(email);
  }
  try {
    const exists = await checkExistsEmail(email);
    const isAvailable = !exists;
    emailCache.set(email, isAvailable);
    return isAvailable;
  } catch (error) {
    console.error("Lỗi khi kiểm tra email tồn tại:", error);
    return true;
  }
};

export const debounceCheckExistsEmail = checkEmailAvailability;

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export const registerSchema = object({
  username: string()
    .trim()
    .required("Vui lòng nhập tên hiển thị")
    .min(3, "Tên hiển thị phải từ 3 đến 30 ký tự")
    .max(30, "Tên hiển thị phải từ 3 đến 30 ký tự")
    .matches(
      USERNAME_REGEX,
      'Tên hiển thị chỉ gồm chữ không dấu, số, "-" và "_"'
    ),
  email: string()
    .required("Vui lòng nhập email")
    .email("Sai định dạng email")
    .test(
      "email-exists",
      "Email này đã được sử dụng",
      async (value) => {
        return await checkEmailAvailability(value);
      }
    ),
  password: string()
    .required("Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu tối thiểu 8 ký tự"),
  password_confirmation: string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([ref("password")], "Mật khẩu xác nhận không khớp"),
});
