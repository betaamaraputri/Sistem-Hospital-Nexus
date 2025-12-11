import { FunctionDeclaration, Type } from "@google/genai";
import { PatientProfile, Appointment, Bill } from "./types";

// --- System Instruction ---
export const SYSTEM_INSTRUCTION = `
Anda adalah koordinator pusat untuk sistem rumah sakit (Hospital System Nexus). 
Peran Anda adalah menganalisis permintaan pengguna dan meneruskannya ke sub-agen yang sesuai menggunakan function calling:
1. Sub-agen Manajemen Pasien (patient_management_agent)
2. Sub-agen Penjadwal Janji Temu (appointment_scheduler_agent)
3. Sub-agen Rekam Medis (medical_records_agent)
4. Sub-agen Penagihan dan Asuransi (billing_insurance_agent)

Instruksi Kritis:
- Tentukan dengan akurat maksud pengguna untuk memilih sub-agen yang benar.
- Hanya panggil SATU sub-agen per permintaan logis.
- Sampaikan semua informasi relevan dari kueri asli pengguna ke argumen fungsi.
- JANGAN mencoba memproses permintaan sendiri (misalnya menjawab diagnosa medis atau mengecek jadwal); selalu delegasikan ke sub-agen/alat.
- Setelah alat mengembalikan respons, sampaikan informasi tersebut kepada pengguna dengan nada profesional, empatik, dan jelas.
- Jika pengguna bertanya hal umum di luar konteks RS, tolak dengan sopan dan ingatkan peran Anda.
`;

// --- Tool Definitions (Gemini Function Declarations) ---

const medicalRecordsTool: FunctionDeclaration = {
  name: "medical_records_agent",
  description: "Mengambil dan merangkum riwayat medis pasien, hasil lab, dan diagnosis.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientId: { type: Type.STRING, description: "ID Pasien atau Nama Pasien" },
      query: { type: Type.STRING, description: "Informasi spesifik yang dicari (mis: 'riwayat diabetes', 'hasil lab terakhir')" }
    },
    required: ["patientId", "query"]
  }
};

const billingTool: FunctionDeclaration = {
  name: "billing_insurance_agent",
  description: "Mengelola pertanyaan penagihan, memproses pembayaran, dan cek asuransi.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientId: { type: Type.STRING, description: "ID Pasien" },
      action: { type: Type.STRING, description: "Tindakan: 'check_status', 'process_payment', 'create_invoice', 'check_insurance'" },
      details: { type: Type.STRING, description: "Detail tambahan jika perlu" }
    },
    required: ["patientId", "action"]
  }
};

const patientManagementTool: FunctionDeclaration = {
  name: "patient_management_agent",
  description: "Mengelola pendaftaran pasien baru atau pembaruan data.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "'register_new', 'update_info', 'get_demographics'" },
      details: { type: Type.STRING, description: "Data JSON stringified berisi nama, kontak, dll." }
    },
    required: ["action", "details"]
  }
};

const appointmentTool: FunctionDeclaration = {
  name: "appointment_scheduler_agent",
  description: "Menangani penjadwalan, penjadwalan ulang, dan pembatalan janji temu.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientId: { type: Type.STRING, description: "ID atau nama pasien" },
      action: { type: Type.STRING, description: "'book', 'reschedule', 'cancel', 'check_availability'" },
      doctor: { type: Type.STRING, description: "Nama dokter (opsional)" },
      time: { type: Type.STRING, description: "Waktu yang diminta (opsional)" }
    },
    required: ["action"]
  }
};

export const TOOLS = [
  medicalRecordsTool,
  billingTool,
  patientManagementTool,
  appointmentTool
];

// --- Mock Data ---

export const MOCK_PATIENTS: PatientProfile[] = [
  { id: "P001", name: "Budi Santoso", dob: "1980-05-12", condition: "Hypertension, Type 2 Diabetes" },
  { id: "P002", name: "Siti Aminah", dob: "1992-08-22", condition: "Prenatal Care" },
  { id: "P003", name: "Joko Widodo", dob: "1975-01-30", condition: "Post-surgery Recovery" }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "APT101", patientId: "P001", doctor: "Dr. Hartono", time: "2023-10-25 10:00 AM", status: "Confirmed" },
  { id: "APT102", patientId: "P002", doctor: "Dr. Linda", time: "2023-10-26 02:00 PM", status: "Pending" }
];

export const MOCK_BILLS: Bill[] = [
  { id: "INV500", patientId: "P001", amount: 1500000, status: "Pending", description: "General Checkup & Lab" },
  { id: "INV501", patientId: "P003", amount: 5000000, status: "Paid", description: "Surgery Downpayment" }
];
