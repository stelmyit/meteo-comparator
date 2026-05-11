import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App.jsx";
import type { ForecastComparison, WeatherDay } from "./types/weather.js";

describe("App", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads default location and displays compared forecasts", async () => {
    mockWeatherFetch();

    render(<App />);

    expect(await screen.findByText("20.3°C")).toBeInTheDocument();
    expect(screen.getByText("Open-Meteo")).toBeInTheDocument();
    expect(screen.getByText("MET Norway")).toBeInTheDocument();
    expect(screen.getByText("2 źródła")).toBeInTheDocument();
  });

  it("searches for another location from the form", async () => {
    const user = userEvent.setup();
    mockWeatherFetch();

    render(<App />);

    await screen.findByText("20.3°C");
    await user.clear(screen.getByRole("searchbox", { name: "Lokalizacja" }));
    await user.type(screen.getByRole("searchbox", { name: "Lokalizacja" }), "Gdańsk");
    await user.click(screen.getByRole("button", { name: "Szukaj" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/geocode?q=Gda%C5%84sk");
    });
    expect(window.location.search).toContain("q=Gda%C5%84sk");
    expect(window.location.search).toContain("lat=52.22977");
  });

  it("filters forecast data by selected day and writes it to the URL", async () => {
    const user = userEvent.setup();
    mockWeatherFetch();

    render(<App />);

    await screen.findByText("20.3°C");
    const daySelect = screen.getAllByRole("combobox")[1];

    if (!daySelect) {
      throw new Error("Day selector was not rendered.");
    }

    await user.selectOptions(daySelect, "2026-05-12");

    expect(screen.getByText("22.0°C")).toBeInTheDocument();
    expect(screen.queryByText("20.3°C")).not.toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("day")).toBe("2026-05-12");
  });

  it("switches the chart metric and writes it to the URL", async () => {
    const user = userEvent.setup();
    mockWeatherFetch();

    render(<App />);

    await user.click(await screen.findByRole("tab", { name: "Wiatr" }));

    expect(screen.getByRole("tab", { name: "Wiatr" })).toHaveAttribute("aria-selected", "true");
    expect(new URLSearchParams(window.location.search).get("metric")).toBe("windMax");
  });

  it("shows a message when the location input is empty", async () => {
    const user = userEvent.setup();
    mockWeatherFetch();

    render(<App />);

    await screen.findByText("20.3°C");
    await user.clear(screen.getByRole("searchbox", { name: "Lokalizacja" }));
    await user.click(screen.getByRole("button", { name: "Szukaj" }));

    expect(screen.getByRole("status")).toHaveTextContent("Podaj nazwę miasta.");
  });

  it("shows a no results status when geocoding returns an empty list", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.startsWith("/api/geocode")) {
        return jsonResponse({ results: [] });
      }

      return jsonResponse<ForecastComparison>({
        generatedAt: "2026-05-11T10:00:00Z",
        location: { label: "Warszawa", latitude: 52.22977, longitude: 21.01178 },
        failedSources: [],
        average: [day("2026-05-11", 20.3, 11.1, 7.1, 18.4)],
        sources: []
      });
    });

    render(<App />);

    await screen.findByText("Nie znaleziono pasującej lokalizacji.");
    await user.clear(screen.getByRole("searchbox", { name: "Lokalizacja" }));
    await user.type(screen.getByRole("searchbox", { name: "Lokalizacja" }), "Atlantyda");
    await user.click(screen.getByRole("button", { name: "Szukaj" }));

    expect(await screen.findByText("Nie znaleziono pasującej lokalizacji.")).toBeInTheDocument();
  });

  it("shows partial provider failures returned by the forecast endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.startsWith("/api/geocode")) {
        return jsonResponse({
          results: [
            {
              id: 756135,
              name: "Warszawa",
              country: "Polska",
              latitude: 52.22977,
              longitude: 21.01178
            }
          ]
        });
      }

      return jsonResponse<ForecastComparison>({
        location: { label: "Warszawa", latitude: 52.22977, longitude: 21.01178 },
        generatedAt: "2026-05-11T10:00:00Z",
        failedSources: ["MET Norway timeout"],
        average: [day("2026-05-11", 20.3, 11.1, 7.1, 18.4)],
        sources: [
          {
            id: "open-meteo",
            name: "Open-Meteo",
            updatedAt: "2026-05-11T10:00:00Z",
            days: [day("2026-05-11", 20.3, 11.1, 7.1, 18.4)]
          }
        ]
      });
    });

    render(<App />);

    expect(await screen.findByText(/Część źródeł nie odpowiedziała/)).toBeInTheDocument();
  });

  it("shows API errors when forecast loading fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.startsWith("/api/geocode")) {
        return jsonResponse({
          results: [
            {
              id: 756135,
              name: "Warszawa",
              country: "Polska",
              latitude: 52.22977,
              longitude: 21.01178
            }
          ]
        });
      }

      return jsonResponse({ error: "Żadne źródło nie odpowiedziało" }, false);
    });

    render(<App />);

    expect(await screen.findByText("Żadne źródło nie odpowiedziało")).toBeInTheDocument();
  });

  it("switches visible labels to English", async () => {
    const user = userEvent.setup();
    mockWeatherFetch();

    render(<App />);

    await screen.findByText("20.3°C");
    await user.selectOptions(screen.getByLabelText("Język"), "en");

    expect(
      await screen.findByRole("heading", { name: "Compare weather forecasts" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByText("2 sources")).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("lang")).toBe("en");
  });

  it("restores a selected location from URL without geocoding first", async () => {
    window.history.replaceState(
      {},
      "",
      "/?lang=en&q=Gdansk&day=2026-05-11&lat=54.35&lon=18.65&label=Gdansk%2C%20Poland"
    );
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      expect(url.startsWith("/api/geocode")).toBe(false);

      return jsonResponse<ForecastComparison>({
        location: { label: "Gdansk, Poland", latitude: 54.35, longitude: 18.65 },
        generatedAt: "2026-05-11T10:00:00Z",
        failedSources: [],
        average: [day("2026-05-11", 20.3, 11.1, 7.1, 18.4)],
        sources: [
          {
            id: "open-meteo",
            name: "Open-Meteo",
            updatedAt: "2026-05-11T10:00:00Z",
            days: [day("2026-05-11", 20.3, 11.1, 7.1, 18.4)]
          }
        ]
      });
    });

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Compare weather forecasts" })
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Location" })).toHaveValue("Gdansk");
    expect(fetch).toHaveBeenCalledWith(
      "/api/forecast?lat=54.35&lon=18.65&label=Gdansk%2C%20Poland"
    );
    expect(screen.getByLabelText("Day")).toHaveValue("2026-05-11");
  });
});

function mockWeatherFetch() {
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);

    if (url.startsWith("/api/geocode")) {
      return jsonResponse({
        results: [
          {
            id: 756135,
            name: url.includes("Gda") ? "Gdańsk" : "Warszawa",
            admin1: "Województwo mazowieckie",
            country: "Polska",
            latitude: 52.22977,
            longitude: 21.01178
          }
        ]
      });
    }

    return jsonResponse<ForecastComparison>({
      location: { label: "Warszawa", latitude: 52.22977, longitude: 21.01178 },
      generatedAt: "2026-05-11T10:00:00Z",
      failedSources: [],
      average: [day("2026-05-11", 20.3, 11.1, 7.1, 18.4), day("2026-05-12", 22, 12, 0, 10)],
      sources: [
        {
          id: "open-meteo",
          name: "Open-Meteo",
          updatedAt: "2026-05-11T10:00:00Z",
          days: [day("2026-05-11", 19.3, 8.9, 6.4, 18.4), day("2026-05-12", 21, 11, 0, 9)]
        },
        {
          id: "met-norway",
          name: "MET Norway",
          updatedAt: "2026-05-11T10:00:00Z",
          days: [day("2026-05-11", 21.2, 13.3, 7.7, 18.4), day("2026-05-12", 23, 13, 0, 11)]
        }
      ]
    });
  });
}

function day(
  date: string,
  temperatureMax: number,
  temperatureMin: number,
  precipitation: number,
  windMax: number
): WeatherDay {
  return {
    date,
    temperatureMax,
    temperatureMin,
    precipitation,
    precipitationProbability: 45,
    windMax
  };
}

function jsonResponse<T>(body: T, ok = true): Response {
  return {
    ok,
    json: async () => body
  } as Response;
}
