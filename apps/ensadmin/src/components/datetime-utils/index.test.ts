import { describe, expect, it } from "vitest";
import { formatDate, formatDatetime } from ".";

describe("formatDatetime", () => {
  it("formats datetime correctly with default options", () => {
    const timestamp = 1672531199;
    const result = formatDatetime(timestamp);
    expect(result).toBe("Jan 1, 2023, 12:59:59 AM");
  });

  it("formats datetime correctly with custom options", () => {
    const timestamp = 1672531199;
    const result = formatDatetime(timestamp, { hour12: false });
    expect(result).toBe("Jan 1, 2023, 00:59:59");
  });
});

describe("formatDate", () => {
  it("formats date correctly with default options", () => {
    const timestamp = 1672531199;
    const result = formatDate(timestamp);
    expect(result).toBe("Jan 1, 2023");
  });

  it("formats date correctly with custom options", () => {
    const timestamp = 1672531199;
    const result = formatDate(timestamp, { year: "2-digit" });
    expect(result).toBe("Jan 1, 23");
  });
});
