import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import { API_ENDPOINTS } from "../utils/api";

export function useCertificates() {
	const { data, isLoading, error } = useFrappeGetCall(
		API_ENDPOINTS.GET_MY_CERTIFICATES,
		{},
		"my-certificates",
		{
			revalidateOnFocus: false,
		}
	);

	const certificates = data?.message || [];

	return { certificates, isLoading, error };
}

export function useCertificate(certificateId) {
	if (!certificateId) {
		return { certificate: null, isLoading: false, error: null };
	}

	const cacheKey = `certificate-${certificateId}`;
	const { data, isLoading, error } = useFrappeGetCall(
		API_ENDPOINTS.GET_CERTIFICATE,
		{ certificate_id: certificateId },
		cacheKey,
		{
			revalidateOnFocus: false,
		}
	);

	const certificate = data?.message || null;

	return { certificate, isLoading, error };
}

export function useGenerateCertificate() {
	const { call, isLoading, error } = useFrappePostCall(API_ENDPOINTS.GENERATE_CERTIFICATE);

	const generateCertificate = async (courseId) => {
		const { message } = await call({ course_id: courseId });
		const certificateId =
			typeof message === "string"
				? message
				: message?.name || message?.certificate_id || message;
		return { success: true, certificateId };
	};

	return { generateCertificate, isLoading, error };
}

export function downloadCertificate(certificateId) {
	window.open(
		`/api/method/wg_lms.api.certificates.download_certificate?certificate_id=${certificateId}`,
		"_blank"
	);
}
