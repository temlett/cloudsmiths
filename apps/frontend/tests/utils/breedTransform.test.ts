import { describe, expect, it } from "vitest";

import { transformBreedResponse } from "../../src/utils/breedTransform";

describe("transformBreedResponse", () => {
  it("flattens and alphabetizes the breed response", () => {
    const result = transformBreedResponse({
      status: "success",
      message: {
        husky: [],
        beagle: [],
        bulldog: ["english"],
      },
    });

    expect(result).toEqual([
      {
        id: "beagle",
        label: "Beagle",
        value: "beagle",
        subBreeds: [],
      },
      {
        id: "bulldog",
        label: "Bulldog",
        value: "bulldog",
        subBreeds: ["english"],
      },
      {
        id: "husky",
        label: "Husky",
        value: "husky",
        subBreeds: [],
      },
    ]);
  });
});
