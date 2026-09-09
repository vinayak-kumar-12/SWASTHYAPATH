const patientService = require("../src/services/patient.service");
const patientModel = require("../src/models/patient.model");
const { publishPatientEvent } = require("../src/services/rabbitmq.service");
const { ConflictError, ForbiddenError, NotFoundError } = require("../src/utils/errors");

jest.mock("../src/models/patient.model");
jest.mock("../src/services/rabbitmq.service", () => ({
  publishPatientEvent: jest.fn().mockResolvedValue(true),
}));

describe("Patient Service Business Logic", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPatientProfile", () => {
    it("should create patient profile and publish PATIENT_CREATED domain event", async () => {
      patientModel.existsByUserId.mockResolvedValueOnce(false);
      patientModel.createPatient.mockResolvedValueOnce({
        patientId: "pat_100",
        userId: "usr_100",
        firstName: "Sarah",
        lastName: "Jenkins",
        status: "ACTIVE",
      });

      const result = await patientService.createPatientProfile("usr_100", {
        first_name: "Sarah",
        last_name: "Jenkins",
      });

      expect(patientModel.existsByUserId).toHaveBeenCalledWith("usr_100");
      expect(result.patientId).toBe("pat_100");
      expect(publishPatientEvent).toHaveBeenCalledWith(
        "patient.created",
        "PATIENT_CREATED",
        expect.objectContaining({ patientId: "pat_100", userId: "usr_100" })
      );
    });

    it("should throw ConflictError if profile already exists for user", async () => {
      patientModel.existsByUserId.mockResolvedValueOnce(true);

      await expect(
        patientService.createPatientProfile("usr_100", { first_name: "Sarah" })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("getPatientById IDOR Protection", () => {
    it("should return patient record if authenticated user owns the profile", async () => {
      patientModel.findPatientById.mockResolvedValueOnce({
        patientId: "pat_100",
        userId: "usr_100",
        firstName: "Sarah",
      });

      const result = await patientService.getPatientById("usr_100", "pat_100", "PATIENT");
      expect(result.firstName).toBe("Sarah");
    });

    it("should throw ForbiddenError if user attempts to access another patient profile", async () => {
      patientModel.findPatientById.mockResolvedValueOnce({
        patientId: "pat_100",
        userId: "usr_100",
        firstName: "Sarah",
      });

      await expect(
        patientService.getPatientById("usr_999", "pat_100", "PATIENT")
      ).rejects.toThrow(ForbiddenError);
    });

    it("should allow DOCTOR or ADMIN role to access another patient profile", async () => {
      patientModel.findPatientById.mockResolvedValueOnce({
        patientId: "pat_100",
        userId: "usr_100",
        firstName: "Sarah",
      });

      const result = await patientService.getPatientById("usr_doctor", "pat_100", "DOCTOR");
      expect(result.firstName).toBe("Sarah");
    });
  });

  describe("softDeletePatientById", () => {
    it("should soft delete patient profile and publish PATIENT_DEACTIVATED event", async () => {
      patientModel.findPatientById.mockResolvedValueOnce({
        patientId: "pat_100",
        userId: "usr_100",
      });
      patientModel.softDeletePatient.mockResolvedValueOnce({
        patientId: "pat_100",
        status: "DELETED",
      });

      const result = await patientService.softDeletePatientById("usr_100", "pat_100", "PATIENT");

      expect(patientModel.softDeletePatient).toHaveBeenCalledWith("pat_100");
      expect(publishPatientEvent).toHaveBeenCalledWith(
        "patient.deactivated",
        "PATIENT_DEACTIVATED",
        expect.objectContaining({ patientId: "pat_100", userId: "usr_100" })
      );
    });
  });
});
