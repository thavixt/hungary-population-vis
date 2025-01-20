import { describe, it, expect } from 'vitest';
import { extrapolateFuturePopulation, fillWithApproximations, type PopulationByYear } from './population';

describe('fillWithApproximations', () => {
  it('should return the original data if there is no previous or next year data available', () => {
    const populationData: PopulationByYear = {
      2020: { male: 4663876, female: 5025500 },
    };
    const result = fillWithApproximations(populationData);
    expect(result).toEqual(populationData);
  });

  it('should add an approximation for the given year based on the nearest previous and next years', () => {
    const populationData: PopulationByYear = {
      2020: { female: 5025500, male: 4663876 },
      2022: { female: 4981528, male: 4628875 },
    };
    const expectedData: PopulationByYear = {
      ...populationData,
      2021: { female: 5003514, male: 4646376 },
    };
    const result = fillWithApproximations(populationData);
    expect(result).toEqual(expectedData);
  });

  it('should handle multiple approximations correctly', () => {
    const populationData: PopulationByYear = {
      2019: { female: 5039416, male: 4660856 },
      2023: { female: 4974484, male: 4625260 },
    };
    const expectedData: PopulationByYear = {
      ...populationData,
      2020: { female: 5023183, male: 4651957 },
      2021: { female: 5006950, male: 4643058 },
      2022: { female: 4990717, male: 4634159 },
    };
    let result = fillWithApproximations(populationData);
    result = fillWithApproximations(result);
    expect(result).toEqual(expectedData);
  });

  it('should handle multiple approximations correctly in several intervals', () => {
    const populationData: PopulationByYear = {
      2012: { female: 5207259, male: 4724666 },
      // missing data points
      2015: { female: 5128422, male: 4687436 },
      2016: { female: 5101174, male: 4678478 },
      2017: { female: 5076104, male: 4663753 },
      // missing data points
      2022: { female: 4981528, male: 4628875 },
    };
    const expectedData: PopulationByYear = {
      ...populationData,
      2013: { female: 5180980, male: 4712256 },
      2014: { female: 5154701, male: 4699846 },
      2018: { female: 5057189, male: 4656777 },
      2019: { female: 5038274, male: 4649802 },
      2020: { female: 5019358, male: 4642826 },
      2021: { female: 5000443, male: 4635851 },
    };
    let result = fillWithApproximations(populationData);
    expect(result).toEqual(expectedData);
  });
});

describe('extrapolateFuturePopulation', () => {
  it('should extrapolate future population correctly for a given number of years and birth rate', () => {
    const pastPopulation: PopulationByYear = {
      2020: { female: 5025500, male: 4663876 },
    };
    const futureNumberOfYears = 3;
    const birthRateFromPastYear = 1.01; // 1% growth rate

    const expectedPopulation: PopulationByYear = {
      ...pastPopulation,
      2021: { female: 5075755, male: 4710515 },
      2022: { female: 5126513, male: 4757620 },
      2023: { female: 5177778, male: 4805196 },
    };

    const result = extrapolateFuturePopulation(pastPopulation, futureNumberOfYears, birthRateFromPastYear);
    expect(result).toEqual(expectedPopulation);
  });

  it('should handle zero future years correctly', () => {
    const pastPopulation: PopulationByYear = {
      2020: { female: 5025500, male: 4663876 },
    };
    const futureNumberOfYears = 0;
    const birthRateFromPastYear = 1.01;

    const expectedPopulation: PopulationByYear = { ...pastPopulation };

    const result = extrapolateFuturePopulation(pastPopulation, futureNumberOfYears, birthRateFromPastYear);
    expect(result).toEqual(expectedPopulation);
  });

  it('should handle negative birth rate correctly', () => {
    const pastPopulation: PopulationByYear = {
      2020: { female: 5025500, male: 4663876 },
    };
    const futureNumberOfYears = 2;
    const birthRateFromPastYear = 0.99; // 1% decline rate

    const expectedPopulation: PopulationByYear = {
      ...pastPopulation,
      2021: { female: 4975245, male: 4617237 },
      2022: { female: 4925493, male: 4571065 },
    };

    const result = extrapolateFuturePopulation(pastPopulation, futureNumberOfYears, birthRateFromPastYear);
    expect(result).toEqual(expectedPopulation);
  });

  it('should handle multiple years of extrapolation correctly', () => {
    const pastPopulation: PopulationByYear = {
      2020: { female: 5025500, male: 4663876 },
    };
    const futureNumberOfYears = 5;
    const birthRateFromPastYear = 1.02; // 2% growth rate

    const expectedPopulation: PopulationByYear = {
      ...pastPopulation,
      2021: { female: 5126010, male: 4757154 },
      2022: { female: 5228530, male: 4852297 },
      2023: { female: 5333101, male: 4949343 },
      2024: { female: 5439763, male: 5048330 },
      2025: { female: 5548558, male: 5149297 },
    };

    const result = extrapolateFuturePopulation(pastPopulation, futureNumberOfYears, birthRateFromPastYear);
    expect(result).toEqual(expectedPopulation);
  });
});