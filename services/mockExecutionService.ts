import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_BILLS } from "../constants";

export const executeMockTool = async (name: string, args: any): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(`[MOCK EXECUTION] Tool: ${name}`, args);

  switch (name) {
    case 'medical_records_agent':
      const patientRec = MOCK_PATIENTS.find(p => p.name.toLowerCase().includes((args.patientId || '').toLowerCase()) || p.id === args.patientId);
      if (!patientRec) return { status: "error", message: "Patient record not found. Please ask user for correct ID or full name." };
      
      return {
        status: "success",
        data: {
          summary: `Medical Record for ${patientRec.name} (ID: ${patientRec.id})`,
          conditions: patientRec.condition,
          recentLabs: "Blood pressure normal, Hba1c 6.5%.",
          notes: "Patient is compliant with medication."
        }
      };

    case 'billing_insurance_agent':
      const patientBill = MOCK_PATIENTS.find(p => p.name.toLowerCase().includes((args.patientId || '').toLowerCase()) || p.id === args.patientId);
      if (!patientBill) return { status: "error", message: "Patient not found for billing." };
      
      const bills = MOCK_BILLS.filter(b => b.patientId === patientBill.id);
      
      if (args.action === 'check_status') {
        return {
          status: "success",
          patient: patientBill.name,
          outstanding_bills: bills
        };
      }
      return { status: "success", message: `Action ${args.action} processed for ${patientBill.name}. Invoice generated successfully.` };

    case 'patient_management_agent':
      if (args.action === 'register_new') {
        const details = JSON.parse(args.details || '{}');
        const newId = `P${Math.floor(Math.random() * 1000)}`;
        return {
          status: "success",
          message: `Patient Registered Successfully.`,
          newPatientId: newId,
          name: details.name || "Unknown"
        };
      }
      return { status: "success", message: "Patient information updated in registry." };

    case 'appointment_scheduler_agent':
      const patientApt = MOCK_PATIENTS.find(p => p.name.toLowerCase().includes((args.patientId || '').toLowerCase()) || p.id === args.patientId);
      
      if (args.action === 'check_availability') {
        return {
          status: "success",
          available_slots: ["10:00 AM", "02:00 PM", "04:30 PM"],
          doctor: args.doctor || "General Practitioner"
        };
      }
      
      if (args.action === 'book') {
        return {
          status: "success",
          message: `Appointment Confirmed for ${patientApt ? patientApt.name : 'Patient'}.`,
          doctor: args.doctor || "Dr. On Call",
          time: args.time || "Next available",
          confirmationCode: `APT-${Math.floor(Math.random() * 10000)}`
        };
      }
      
      return { status: "success", message: `Appointment action '${args.action}' completed.` };

    default:
      return { status: "error", message: "Unknown tool called." };
  }
};
