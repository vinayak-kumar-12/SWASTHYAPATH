const { registerUser, loginUser, verifyEmail, resendVerificationEmail } = require("../service/auth.service");
const userModel = require("../models/user.model");
const authTokenModel = require("../models/authToken.model");
const { publishEvent } = require("../config/rabbitmq");
const { EmailNotVerifiedError, UnauthorizedError } = require("../utils/errors");

jest.mock("../config/database", () => {
  const mockClient = {
    query: jest.fn().mockImplementation((sql) => {
      if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") {
        return Promise.resolve();
      }
      return Promise.resolve({ rows: [] });
    }),
    release: jest.fn(),
  };

  return {
    pool: {
      connect: jest.fn().mockResolvedValue(mockClient),
      query: jest.fn().mockResolvedValue({ rows: [] }),
    },
    query: jest.fn().mockResolvedValue({ rows: [] }),
  };
});

jest.mock("../config/rabbitmq", () => ({
  connectRabbitMQ: jest.fn().mockResolvedValue({ connection: {}, channel: {} }),
  publishEvent: jest.fn().mockResolvedValue({ published: true, envelope: {} }),
  isRabbitMQConnected: () => true,
  closeRabbitMQ: jest.fn().mockResolvedValue(true),
}));

jest.mock("../models/user.model");
jest.mock("../models/authToken.model");

describe("Email Verification System - UserAuthSvc", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register unverified user and publish EMAIL_VERIFICATION_REQUESTED event", async () => {
      userModel.findUserByEmail.mockResolvedValueOnce(null);
      userModel.createUser.mockResolvedValueOnce({
        userId: "usr_100",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        passwordHash: "hashed_pwd",
        role: "PATIENT",
        isVerified: false,
      });
      authTokenModel.createToken.mockResolvedValueOnce({ tokenId: "tok_1" });

      const result = await registerUser({
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        password: "Password123!",
        role: "PATIENT",
      });

      expect(result.user.isVerified).toBe(false);
      expect(publishEvent).toHaveBeenCalledWith(
        expect.any(String),
        "EMAIL_VERIFICATION_REQUESTED",
        expect.objectContaining({
          userId: "usr_100",
          email: "john@example.com",
          verificationToken: expect.any(String),
        })
      );
    });
  });

  describe("loginUser verification guard", () => {
    it("should throw EmailNotVerifiedError when logging in with unverified email", async () => {
      userModel.findUserByEmail.mockResolvedValueOnce({
        userId: "usr_100",
        email: "john@example.com",
        passwordHash: "$2b$12$somehash",
        isVerified: false,
      });

      // Mock bcrypt compare
      const bcrypt = require("bcrypt");
      jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);

      await expect(
        loginUser({ email: "john@example.com", password: "Password123!" })
      ).rejects.toThrow(EmailNotVerifiedError);
    });
  });

  describe("verifyEmail", () => {
    it("should verify user, mark token used, and publish EMAIL_VERIFIED event", async () => {
      authTokenModel.findTokenByHash.mockResolvedValueOnce({
        tokenId: "tok_1",
        userId: "usr_100",
        usedAt: null,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      userModel.markUserEmailVerified.mockResolvedValueOnce({
        userId: "usr_100",
        email: "john@example.com",
        name: "John Doe",
        isVerified: true,
      });

      const result = await verifyEmail("valid_raw_token");

      expect(result.message).toBe("Email verified successfully");
      expect(authTokenModel.markTokenUsed).toHaveBeenCalled();
      expect(publishEvent).toHaveBeenCalledWith(
        expect.any(String),
        "EMAIL_VERIFIED",
        expect.objectContaining({
          userId: "usr_100",
          email: "john@example.com",
        })
      );
    });

    it("should throw UnauthorizedError for expired or invalid token", async () => {
      authTokenModel.findTokenByHash.mockResolvedValueOnce(null);

      await expect(verifyEmail("invalid_raw_token")).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("resendVerificationEmail", () => {
    it("should invalidate old tokens, store new 15-min token hash, and publish event", async () => {
      userModel.findUserByEmail.mockResolvedValueOnce({
        userId: "usr_100",
        email: "john@example.com",
        name: "John Doe",
        isVerified: false,
      });

      const result = await resendVerificationEmail("john@example.com");

      expect(result.message).toContain("verification link has been sent");
      expect(authTokenModel.invalidateTokens).toHaveBeenCalledWith(
        "usr_100",
        "EMAIL_VERIFICATION",
        expect.anything()
      );
      expect(publishEvent).toHaveBeenCalledWith(
        expect.any(String),
        "EMAIL_VERIFICATION_REQUESTED",
        expect.objectContaining({
          userId: "usr_100",
          verificationToken: expect.any(String),
        })
      );
    });
  });
});
