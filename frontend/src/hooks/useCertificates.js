import { useState, useEffect } from "react";
import { callAPI } from "../utils/api";

export function useCertificates() {
	const [certificates, setCertificates] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCertificates = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await callAPI("wg_lms.api.certificates.get_my_certificates");
				setCertificates(data || []);
			} catch (err) {
				setError(err.message || "Failed to load certificates");
				setCertificates([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCertificates();
	}, []);

	return { certificates, isLoading, error };
}

export function useCertificate(certificateId) {
	const [certificate, setCertificate] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!certificateId) {
			setIsLoading(false);
			return;
		}

		const fetchCertificate = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await callAPI("wg_lms.api.certificates.get_certificate", {
					certificate_id: certificateId,
				});
				setCertificate(data);
			} catch (err) {
				setError(err.message || "Failed to load certificate");
			} finally {
				setIsLoading(false);
			}
		};

		fetchCertificate();
	}, [certificateId]);

	return { certificate, isLoading, error };
}

export function useGenerateCertificate() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const generateCertificate = async (courseId) => {
		try {
			setLoading(true);
			setError(null);
			const certificateId = await callAPI("wg_lms.api.certificates.generate_certificate", {
				course_id: courseId,
			});
			return { success: true, certificateId };
		} catch (err) {
			setError(err.message || "Failed to generate certificate");
			return { success: false, error: err.message };
		} finally {
			setLoading(false);
		}
	};

	return { generateCertificate, loading, error };
}

export function downloadCertificate(certificateId) {
	window.open(
		`/api/method/wg_lms.api.certificates.download_certificate?certificate_id=${certificateId}`,
		"_blank"
	);
}
