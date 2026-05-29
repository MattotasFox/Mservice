import { describe, expect, it } from "vitest";
import { getMaintenanceRecommendations } from "@/lib/maintenanceRecommendations";

describe("getMaintenanceRecommendations", () => {
  it("recommends oil change for a 2004 Corsa at 25.000 km", () => {
    const recommendations = getMaintenanceRecommendations({
      marca: "Chevrolet",
      modelo: "Corsa",
      anio: "2004",
      kilometraje: "25000",
    });

    expect(recommendations[0]).toMatchObject({
      title: "Cambio de aceite de motor",
      priority: "due",
      dueKm: 25000,
    });
  });

  it("returns no recommendations without a valid mileage", () => {
    expect(
      getMaintenanceRecommendations({
        marca: "Toyota",
        modelo: "Corolla",
        anio: "2020",
        kilometraje: "",
      })
    ).toEqual([]);
  });
});
