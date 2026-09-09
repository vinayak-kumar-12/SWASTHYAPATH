const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const patientModel = require("../src/models/patient.model");

jest.mock("../src/models/patient.model");
jest.mock("../src/config/database", () => ({
  pool: {
    query: jest.fn().mockResolvedValue({ rows: [{ now: new Date() }] }),
  },
  query: jest.fn(),
  connectDB: jest.fn(),
  closeDB: jest.fn(),
}));

jest.mock("../src/config/rabbitmq", () => ({
  connectRabbitMQ: jest.fn().mockResolvedValue({
    channel: { publish: jest.fn().mockReturnValue(true) },
    config: { exchange: "swastyapath.events" },
  }),
  getChannel: jest.fn().mockReturnValue({ publish: jest.fn().mockReturnValue(true) }),
  isRabbitMQConnected: () => true,
  closeRabbitMQ: jest.fn(),
}));

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "8be9920e17dd8034952b95754f5212a8cac1f66d90a7121d3303ec06a59bc36d";

const generateTestToken = (userId = "usr_100", role = "PATIENT") => {
  return jwt.sign({ sub: userId, role, type: "access" }, ACCESS_SECRET, { expiresIn: "1h" });
};

describe("Patient Service HTTP API Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /health & GET /ready", () => {
    it("should return 200 OK for /health", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("healthy");
    });

    it("should return 200 OK for /ready", async () => {
      const res = await request(app).get("/ready");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ready");
    });
  });

  describe("Authentication Guard", () => {
    it("should reject request with 401 Unauthorized if Bearer token is missing", async () => {
      const res = await request(app).get("/api/v1/patients/me");
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("TOKEN_REQUIRED");
    });
  });

  describe("POST /api/v1/patients", () => {
    it("should create patient profile when valid JWT and payload are provided", async () => {
      const token = generateTestToken("usr_100");
      patientModel.existsByUserId.mockResolvedValueOnce(false);
      patientModel.createPatient.mockResolvedValueOnce({
        patientId: "pat_555",
        userId: "usr_100",
        firstName: "Alex",
        lastName: "Morgan",
        status: "ACTIVE",
      });

      const res = await request(app)
        .post("/api/v1/patients")
        .set("Authorization", `Bearer ${token}`)
        .send({
          first_name: "Alex",
          last_name: "Morgan",
          gender: "FEMALE",
          phone: "+15550001111",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patientId).toBe("pat_555");
    });

    it("should return 422 Unprocessable Entity on validation error", async () => {
      const token = generateTestToken("usr_100");
      const res = await request(app)
        .post("/api/v1/patients")
        .set("Authorization", `Bearer ${token}`)
        .send({
          first_name: "A", // min 2 chars
        });

      expect(res.status).toBe(422);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/v1/patients/me", () => {
    it("should return patient profile for authenticated user", async () => {
      const token = generateTestToken("usr_100");
      patientModel.findPatientByUserId.mockResolvedValueOnce({
        patientId: "pat_555",
        userId: "usr_100",
        firstName: "Alex",
        status: "ACTIVE",
      });

      const res = await request(app)
        .get("/api/v1/patients/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.patientId).toBe("pat_555");
    });
  });
});
