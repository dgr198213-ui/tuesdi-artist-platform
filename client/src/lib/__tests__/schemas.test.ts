import { describe, it, expect } from "vitest";
import { artistProfileSchema } from "../schemas/artistProfile";
import { eventFormSchema } from "../schemas/eventForm";
import { contactFormSchema } from "../schemas/contactForm";

// ─── artistProfileSchema ───────────────────────────────────────────────

describe("artistProfileSchema", () => {
  const validData = {
    artist_name: "DJ Test",
    category: "DJ",
    city: "Madrid",
  };

  it("passes with valid minimal data", () => {
    const result = artistProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("passes with full valid data including optional URLs", () => {
    const result = artistProfileSchema.safeParse({
      ...validData,
      bio: "Una biografía de prueba",
      instagram: "https://instagram.com/test",
      youtube: "https://youtube.com/@test",
      spotify: "https://open.spotify.com/artist/test",
      website: "https://test.com",
    });
    expect(result.success).toBe(true);
  });

  it("fails when artist_name is missing", () => {
    const result = artistProfileSchema.safeParse({
      category: "DJ",
      city: "Madrid",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes("artist_name"));
      expect(nameError?.message).toContain("expected string");
    }
  });

  it("fails when artist_name is empty string", () => {
    const result = artistProfileSchema.safeParse({
      ...validData,
      artist_name: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when category is missing", () => {
    const result = artistProfileSchema.safeParse({
      artist_name: "DJ Test",
      city: "Madrid",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const catError = result.error.issues.find((i) => i.path.includes("category"));
      expect(catError?.message).toContain("expected string");
    }
  });

  it("fails when city is missing", () => {
    const result = artistProfileSchema.safeParse({
      artist_name: "DJ Test",
      category: "DJ",
    });
    expect(result.success).toBe(false);
  });

  it("fails when city is empty string", () => {
    const result = artistProfileSchema.safeParse({
      ...validData,
      city: "",
    });
    expect(result.success).toBe(false);
  });

  it("enforces max length on artist_name (100)", () => {
    const result = artistProfileSchema.safeParse({
      ...validData,
      artist_name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("artist_name"));
      expect(err?.message).toBe("Máximo 100 caracteres");
    }
  });

  it("enforces max length on bio (2000)", () => {
    const result = artistProfileSchema.safeParse({
      ...validData,
      bio: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("bio"));
      expect(err?.message).toBe("Máximo 2000 caracteres");
    }
  });

  it("fails with invalid URL for instagram", () => {
    const result = artistProfileSchema.safeParse({
      ...validData,
      instagram: "not-a-url",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("instagram"));
      expect(err?.message).toBe("URL no válida");
    }
  });

  it("fails with invalid URL for youtube", () => {
    const result = artistProfileSchema.safeParse({
      ...validData,
      youtube: "not-a-valid-url",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("youtube"));
      expect(err?.message).toBe("URL no válida");
    }
  });

  it("fails with invalid URL for website", () => {
    const result = artistProfileSchema.safeParse({
      ...validData,
      website: "just-text",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("website"));
      expect(err?.message).toBe("URL no válida");
    }
  });

  it("passes with empty strings for optional URL fields", () => {
    const result = artistProfileSchema.safeParse({
      ...validData,
      instagram: "",
      youtube: "",
      spotify: "",
      website: "",
    });
    expect(result.success).toBe(true);
  });
});

// ─── eventFormSchema ───────────────────────────────────────────────────

describe("eventFormSchema", () => {
  const validData = {
    title: "Concierto de prueba",
    category: "Concierto",
    location: "Sala Apolo",
    city: "Barcelona",
    event_date: "2025-08-15",
    organizer_email: "org@test.com",
  };

  it("passes with valid data", () => {
    const result = eventFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("passes with full valid data including optional fields", () => {
    const result = eventFormSchema.safeParse({
      ...validData,
      description: "Una descripción del evento",
      event_time: "21:00",
      organizer_name: "Organizador Test",
      country: "México",
    });
    expect(result.success).toBe(true);
  });

  it("fails when title is missing", () => {
    const result = eventFormSchema.safeParse({
      category: "Concierto",
      city: "Barcelona",
      event_date: "2025-08-15",
      organizer_email: "org@test.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("title"));
      expect(err?.message).toContain("expected string");
    }
  });

  it("fails when title is empty string", () => {
    const result = eventFormSchema.safeParse({
      ...validData,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when category is missing", () => {
    const result = eventFormSchema.safeParse({
      title: "Concierto de prueba",
      city: "Barcelona",
      event_date: "2025-08-15",
      organizer_email: "org@test.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("category"));
      expect(err?.message).toContain("expected string");
    }
  });

  it("fails when city is missing", () => {
    const result = eventFormSchema.safeParse({
      title: "Concierto de prueba",
      category: "Concierto",
      event_date: "2025-08-15",
      organizer_email: "org@test.com",
    });
    expect(result.success).toBe(false);
  });

  it("fails when event_date is missing", () => {
    const result = eventFormSchema.safeParse({
      title: "Concierto de prueba",
      category: "Concierto",
      city: "Barcelona",
      organizer_email: "org@test.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("event_date"));
      expect(err?.message).toContain("expected string");
    }
  });

  it("fails with invalid organizer_email", () => {
    const result = eventFormSchema.safeParse({
      ...validData,
      organizer_email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("organizer_email"));
      expect(err?.message).toBe("Email no válido");
    }
  });

  it("fails when organizer_email is empty", () => {
    const result = eventFormSchema.safeParse({
      ...validData,
      organizer_email: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("organizer_email"));
      // .email() validates before .min(), so we get "Email no válido"
      expect(err?.message).toBe("Email no válido");
    }
  });

  it("enforces max length on title (200)", () => {
    const result = eventFormSchema.safeParse({
      ...validData,
      title: "a".repeat(201),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("title"));
      expect(err?.message).toBe("Máximo 200 caracteres");
    }
  });

  it("enforces max length on description (2000)", () => {
    const result = eventFormSchema.safeParse({
      ...validData,
      description: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("description"));
      expect(err?.message).toBe("Máximo 2000 caracteres");
    }
  });
});

// ─── contactFormSchema ─────────────────────────────────────────────────

describe("contactFormSchema", () => {
  const validData = {
    name: "Juan Pérez",
    email: "juan@example.com",
    subject: "Consulta sobre eventos",
    message: "Hola, me gustaría saber más sobre los eventos próximos.",
  };

  it("passes with valid data", () => {
    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when name is missing", () => {
    const result = contactFormSchema.safeParse({
      email: "juan@example.com",
      subject: "Consulta",
      message: "Hola, este es un mensaje de prueba con más de 10 caracteres.",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("name"));
      expect(err?.message).toContain("expected string");
    }
  });

  it("fails when name is empty string", () => {
    const result = contactFormSchema.safeParse({
      ...validData,
      name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("name"));
      expect(err?.message).toBe("El nombre es obligatorio");
    }
  });

  it("fails when email is missing", () => {
    const result = contactFormSchema.safeParse({
      name: "Juan",
      subject: "Consulta",
      message: "Hola, este es un mensaje de prueba con más de 10 caracteres.",
    });
    expect(result.success).toBe(false);
  });

  it("fails when email is empty string", () => {
    const result = contactFormSchema.safeParse({
      ...validData,
      email: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid email", () => {
    const result = contactFormSchema.safeParse({
      ...validData,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("email"));
      expect(err?.message).toBe("Email no válido");
    }
  });

  it("fails when subject is missing", () => {
    const result = contactFormSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      message: "Hola, este es un mensaje de prueba con más de 10 caracteres.",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("subject"));
      expect(err?.message).toContain("expected string");
    }
  });

  it("fails when subject is empty string", () => {
    const result = contactFormSchema.safeParse({
      ...validData,
      subject: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when message is too short (< 10 chars)", () => {
    const result = contactFormSchema.safeParse({
      ...validData,
      message: "Hola",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes("message"));
      expect(err?.message).toBe("El mensaje debe tener al menos 10 caracteres");
    }
  });

  it("fails when message is missing", () => {
    const result = contactFormSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      subject: "Consulta",
    });
    expect(result.success).toBe(false);
  });

  it("enforces max length on name (100)", () => {
    const result = contactFormSchema.safeParse({
      ...validData,
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("enforces max length on subject (200)", () => {
    const result = contactFormSchema.safeParse({
      ...validData,
      subject: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("enforces max length on message (2000)", () => {
    const result = contactFormSchema.safeParse({
      ...validData,
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("passes when message is exactly 10 characters", () => {
    const result = contactFormSchema.safeParse({
      ...validData,
      message: "1234567890",
    });
    expect(result.success).toBe(true);
  });
});