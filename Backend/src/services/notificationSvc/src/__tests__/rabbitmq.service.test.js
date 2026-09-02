const { publishEvent } = require("../services/rabbitmq.service");
const { processNotificationEvent } = require("../services/notification.service");
const { Notification } = require("../models/notification.model");

// Mock amqplib and mongoose dependencies for clean isolated testing
jest.mock("../config/rabbitmq", () => {
  const mockChannel = {
    assertExchange: jest.fn().mockResolvedValue(true),
    assertQueue: jest.fn().mockResolvedValue({ queue: "notification-service" }),
    bindQueue: jest.fn().mockResolvedValue(true),
    prefetch: jest.fn().mockResolvedValue(true),
    publish: jest.fn().mockReturnValue(true),
    ack: jest.fn(),
    nack: jest.fn(),
    consume: jest.fn().mockResolvedValue({ consumerTag: "mock-tag" }),
  };

  return {
    connectRabbitMQ: jest.fn().mockResolvedValue({
      connection: {},
      channel: mockChannel,
      config: {
        exchange: "swastyapath.events",
        exchangeType: "topic",
        queue: "notification-service",
        routingKey: "notification.email",
        dlx: "swastyapath.dlx",
        dlq: "notification-service.dlq",
        prefetch: 10,
        maxRetries: 3,
      },
    }),
    getChannel: () => mockChannel,
    getConnection: () => ({}),
    isRabbitMQConnected: () => true,
    closeRabbitMQ: jest.fn().mockResolvedValue(true),
    getRabbitMQConfig: () => ({
      exchange: "swastyapath.events",
      routingKey: "notification.email",
      maxRetries: 3,
    }),
  };
});

jest.mock("../models/notification.model", () => {
  const mockModel = jest.fn();
  mockModel.findOne = jest.fn();
  return {
    Notification: mockModel,
    NOTIFICATION_TYPES: {
      EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
      PASSWORD_RESET: "PASSWORD_RESET",
      WELCOME_EMAIL: "WELCOME_EMAIL",
    },
    NOTIFICATION_CHANNELS: {
      EMAIL: "EMAIL",
    },
    NOTIFICATION_STATUS: {
      PENDING: "PENDING",
      PROCESSING: "PROCESSING",
      SENT: "SENT",
      FAILED: "FAILED",
      RETRYING: "RETRYING",
    },
  };
});

jest.mock("../services/email.service", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({ messageId: "msg_123" }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ messageId: "msg_456" }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ messageId: "msg_789" }),
}));

describe("RabbitMQ Service Integration Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("publishEvent Envelope", () => {
    it("should construct a standard event envelope and publish persistently", async () => {
      const result = await publishEvent("notification.email", {
        eventType: "USER_REGISTERED",
        source: "auth-service",
        data: {
          userId: "usr_999",
          email: "test@example.com",
          name: "Test User",
        },
      });

      expect(result.published).toBe(true);
      expect(result.envelope).toHaveProperty("eventId");
      expect(result.envelope.eventType).toBe("USER_REGISTERED");
      expect(result.envelope.version).toBe(1);
      expect(result.envelope.source).toBe("auth-service");
      expect(result.envelope.data.userId).toBe("usr_999");
      expect(result.envelope.data.email).toBe("test@example.com");
    });
  });

  describe("Idempotency Guard", () => {
    it("should skip duplicate execution when eventId has already been SENT", async () => {
      Notification.findOne.mockResolvedValueOnce({
        notificationId: "notif_111",
        eventId: "evt_duplicate",
        status: "SENT",
      });

      const result = await processNotificationEvent({
        event: "WELCOME_EMAIL",
        eventId: "evt_duplicate",
        userId: "usr_123",
        email: "user@example.com",
      });

      expect(Notification.findOne).toHaveBeenCalledWith({ eventId: "evt_duplicate" });
      expect(result.status).toBe("SENT");
    });
  });
});
