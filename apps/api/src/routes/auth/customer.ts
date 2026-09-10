import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { bruteForceGuard } from "../../services/security/brute-force.js";

export async function customerAuthRoutes(fastify: FastifyInstance) {
  // ---------------------------------------------------------------------------
  // Helper: Decode and extract customer from JWT Bearer token
  // ---------------------------------------------------------------------------
  async function authenticateCustomer(request: any) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = fastify.jwt.verify<{ sub: string; email: string; role: string }>(token);
      return decoded;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // POST /auth/customer/register
  // Real customer registration into Supabase / PostgreSQL database
  // ---------------------------------------------------------------------------
  fastify.post("/register", async (request, reply) => {
    try {
      const body = request.body as {
        name?: string;
        identifier?: string;
        email?: string;
        phone?: string;
        password?: string;
      };

      const name = (body.name || "").trim();
      const password = (body.password || "").trim();
      const rawIdentifier = (body.identifier || body.email || body.phone || "").trim();

      if (!name) {
        return reply.status(400).send({ success: false, error: "Full name is required" });
      }
      if (!rawIdentifier) {
        return reply.status(400).send({ success: false, error: "Email or mobile number is required" });
      }
      if (!password || password.length < 6) {
        return reply.status(400).send({ success: false, error: "Password must be at least 6 characters" });
      }

      let email = (body.email || "").trim().toLowerCase();
      let phone = (body.phone || "").trim();

      // If identifier was provided in place of email/phone, resolve it
      if (rawIdentifier.includes("@")) {
        email = rawIdentifier.toLowerCase();
      } else {
        // Assume phone number
        phone = rawIdentifier;
        if (!email) {
          const digits = phone.replace(/[^0-9]/g, "");
          email = `customer_${digits}@tatkabazar.com`;
        }
      }

      // Check if user already exists
      const orConditions: any[] = [];
      if (email) orConditions.push({ email });
      if (phone) orConditions.push({ phone });

      const existing = await prisma.user.findFirst({
        where: { OR: orConditions },
      });

      if (existing) {
        return reply.status(409).send({
          success: false,
          error: "An account with this email or mobile number already exists. Please login instead.",
        });
      }

      const passwordHash = await bcrypt.hash(password, Number(process.env["BCRYPT_ROUNDS"]) || 12);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          passwordHash,
          isVerified: true,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      const accessToken = fastify.jwt.sign({
        sub: user.id,
        role: "customer",
        email: user.email,
      });

      return reply.status(201).send({
        success: true,
        data: {
          accessToken,
          expiresIn: 7 * 24 * 60 * 60,
          user: {
            ...user,
            emailOrPhone: phone || user.email,
            role: "customer",
            vipTier: "VIP Member",
          },
        },
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({
        success: false,
        error: "Registration failed: " + (err.message || "Database error"),
      });
    }
  });

  // ---------------------------------------------------------------------------
  // POST /auth/customer/login
  // Real login with Email OR Mobile Number, connected to PostgreSQL
  // ---------------------------------------------------------------------------
  fastify.post("/login", async (request, reply) => {
    try {
      const body = request.body as {
        identifier?: string;
        email?: string;
        password?: string;
      };

      const identifier = (body.identifier || body.email || "").trim();
      const password = (body.password || "").trim();

      if (!identifier) {
        return reply.status(400).send({
          success: false,
          error: "Please enter your email or mobile number.",
        });
      }

      if (!password) {
        return reply.status(400).send({
          success: false,
          error: "Please enter your password.",
        });
      }

      // Check account lockout status for brute-force protection
      const lockStatus = bruteForceGuard.isLocked(identifier);
      if (lockStatus.locked) {
        return reply.status(423).send({
          success: false,
          error: "Account Locked",
          message: `Account is temporarily locked due to too many failed attempts. Please retry in ${lockStatus.remainingMinutes} minutes.`,
          retryAfterMinutes: lockStatus.remainingMinutes,
        });
      }

      // Look up user by Email OR Phone (matching both raw and formatted phone numbers)
      const cleanPhone = identifier.replace(/[^0-9]/g, "");
      const orFilters: any[] = [
        { email: identifier.toLowerCase() },
        { phone: identifier },
      ];

      if (cleanPhone.length >= 10) {
        orFilters.push({ phone: cleanPhone });
        orFilters.push({ phone: `+88${cleanPhone}` });
        orFilters.push({ phone: `88${cleanPhone}` });
        if (cleanPhone.startsWith("880")) {
          orFilters.push({ phone: `0${cleanPhone.slice(3)}` });
        }
      }

      const user = await prisma.user.findFirst({
        where: { OR: orFilters },
      });

      if (!user || !user.isActive) {
        const attempt = bruteForceGuard.recordFailedAttempt(identifier);
        return reply.status(401).send({
          success: false,
          error: "Invalid credentials",
          message: attempt.locked
            ? "Account locked for 10 minutes after 5 failed attempts."
            : `Invalid email/mobile or password. ${attempt.attemptsLeft} attempts remaining before temporary lockout.`,
          attemptsLeft: attempt.attemptsLeft,
        });
      }

      // Check if user was registered via Google OAuth without password
      if (!user.passwordHash || user.passwordHash === "GOOGLE_OAUTH") {
        return reply.status(400).send({
          success: false,
          error: "Google Account",
          message: "This account was created with Google Sign-In. Please click 'Continue with Google' to log in.",
        });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        const attempt = bruteForceGuard.recordFailedAttempt(identifier);
        return reply.status(401).send({
          success: false,
          error: "Invalid credentials",
          message: attempt.locked
            ? "Account locked for 10 minutes after 5 failed attempts."
            : `Invalid email/mobile or password. ${attempt.attemptsLeft} attempts remaining before temporary lockout.`,
          attemptsLeft: attempt.attemptsLeft,
        });
      }

      // Reset attempts on successful login
      bruteForceGuard.recordSuccess(identifier);

      const accessToken = fastify.jwt.sign({
        sub: user.id,
        role: "customer",
        email: user.email,
      });

      return reply.send({
        success: true,
        data: {
          accessToken,
          expiresIn: 7 * 24 * 60 * 60,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            avatarUrl: user.avatarUrl,
            emailOrPhone: user.phone || user.email,
            role: "customer",
            vipTier: "VIP Member",
          },
        },
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({
        success: false,
        error: "Login error: " + (err.message || "Internal server error"),
      });
    }
  });

  // ---------------------------------------------------------------------------
  // POST /auth/customer/google
  // Real Google Sign-In endpoint connected to PostgreSQL database
  // ---------------------------------------------------------------------------
  fastify.post("/google", async (request, reply) => {
    try {
      const body = request.body as {
        credential?: string; // Google ID Token JWT from Google Identity Services
        email?: string;
        name?: string;
        avatarUrl?: string;
        googleId?: string;
      };

      let googleEmail = (body.email || "").trim().toLowerCase();
      let googleName = (body.name || "").trim();
      let googleAvatar = body.avatarUrl || null;

      // If Google ID Token (credential) is provided, verify it with Google tokeninfo
      if (body.credential) {
        try {
          const verifyRes = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`
          );
          if (verifyRes.ok) {
            const tokenInfo = (await verifyRes.json()) as {
              email?: string;
              name?: string;
              picture?: string;
              sub?: string;
              email_verified?: string | boolean;
            };

            if (tokenInfo.email) {
              googleEmail = tokenInfo.email.toLowerCase();
              googleName = tokenInfo.name || googleName || (googleEmail.split("@")[0] ?? "Google User");
              googleAvatar = tokenInfo.picture || googleAvatar;
            }
          }
        } catch (tokenErr: any) {
          fastify.log.warn(`Google tokeninfo fetch failed, falling back to body params: ${tokenErr.message}`);
        }
      } else if ((body as any).accessToken) {
        try {
          const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${(body as any).accessToken}` },
          });
          if (userInfoRes.ok) {
            const tokenInfo = (await userInfoRes.json()) as {
              email?: string;
              name?: string;
              picture?: string;
              sub?: string;
            };
            if (tokenInfo.email) {
              googleEmail = tokenInfo.email.toLowerCase();
              googleName = tokenInfo.name || googleName || (googleEmail.split("@")[0] ?? "Google User");
              googleAvatar = tokenInfo.picture || googleAvatar;
            }
          }
        } catch (tokenErr: any) {
          fastify.log.warn(`Google userinfo fetch failed: ${tokenErr.message}`);
        }
      }

      if (!googleEmail || !googleEmail.includes("@")) {
        return reply.status(400).send({
          success: false,
          error: "Valid Google email could not be verified. Please try again.",
        });
      }

      if (!googleName) {
        googleName = googleEmail.split("@")[0] ?? "Tatka Customer";
      }

      // Find or create customer in PostgreSQL database
      let user = await prisma.user.findUnique({
        where: { email: googleEmail },
      });

      if (user) {
        // Existing user: update avatar if newly provided
        if ((!user.avatarUrl && googleAvatar) || !user.isVerified) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              avatarUrl: user.avatarUrl || googleAvatar,
              isVerified: true,
            },
          });
        }
      } else {
        // Create new user directly in database
        user = await prisma.user.create({
          data: {
            name: googleName,
            email: googleEmail,
            avatarUrl: googleAvatar,
            phone: null,
            passwordHash: "GOOGLE_OAUTH",
            isVerified: true,
            isActive: true,
          },
        });
      }

      const accessToken = fastify.jwt.sign({
        sub: user.id,
        role: "customer",
        email: user.email,
      });

      return reply.send({
        success: true,
        data: {
          accessToken,
          expiresIn: 7 * 24 * 60 * 60,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            avatarUrl: user.avatarUrl,
            emailOrPhone: user.email,
            role: "customer",
            vipTier: "VIP Member",
          },
        },
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({
        success: false,
        error: "Google authentication failed: " + (err.message || "Database error"),
      });
    }
  });

  // ---------------------------------------------------------------------------
  // GET /auth/customer/me
  // Get current customer profile & saved addresses from database
  // ---------------------------------------------------------------------------
  fastify.get("/me", async (request, reply) => {
    try {
      const decoded = await authenticateCustomer(request);
      if (!decoded) {
        return reply.status(401).send({ success: false, error: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        include: {
          addresses: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!user || !user.isActive) {
        return reply.status(404).send({ success: false, error: "User not found or inactive" });
      }

      return reply.send({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          emailOrPhone: user.phone || user.email,
          isVerified: user.isVerified,
          addresses: user.addresses,
          vipTier: "VIP Member",
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // GET /auth/customer/addresses
  // List customer addresses from PostgreSQL
  // ---------------------------------------------------------------------------
  fastify.get("/addresses", async (request, reply) => {
    try {
      const decoded = await authenticateCustomer(request);
      if (!decoded) {
        return reply.status(401).send({ success: false, error: "Unauthorized" });
      }

      const addresses = await prisma.address.findMany({
        where: { userId: decoded.sub },
        orderBy: { createdAt: "desc" },
      });

      return reply.send({ success: true, data: addresses });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // POST /auth/customer/addresses
  // Add new address to database
  // ---------------------------------------------------------------------------
  fastify.post("/addresses", async (request, reply) => {
    try {
      const decoded = await authenticateCustomer(request);
      if (!decoded) {
        return reply.status(401).send({ success: false, error: "Unauthorized" });
      }

      const body = request.body as {
        label?: string;
        line1: string;
        line2?: string;
        area: string;
        city: string;
        postCode?: string;
        isDefault?: boolean;
      };

      if (!body.line1 || !body.area || !body.city) {
        return reply.status(400).send({
          success: false,
          error: "Address, area, and city are required.",
        });
      }

      if (body.isDefault) {
        await prisma.address.updateMany({
          where: { userId: decoded.sub },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: {
          userId: decoded.sub,
          label: body.label || "Home",
          line1: body.line1,
          line2: body.line2 ?? null,
          area: body.area,
          city: body.city,
          postCode: body.postCode ?? null,
          isDefault: body.isDefault ?? false,
        },
      });

      return reply.status(201).send({ success: true, data: address });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // DELETE /auth/customer/addresses/:id
  // ---------------------------------------------------------------------------
  fastify.delete("/addresses/:id", async (request, reply) => {
    try {
      const decoded = await authenticateCustomer(request);
      if (!decoded) {
        return reply.status(401).send({ success: false, error: "Unauthorized" });
      }

      const { id } = request.params as { id: string };

      await prisma.address.deleteMany({
        where: { id, userId: decoded.sub },
      });

      return reply.send({ success: true, message: "Address deleted" });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
