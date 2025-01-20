import { sortObjectByKeys } from "./utils";

export type Gender = 'female' | 'male';
export type PopulationByYear = Record<number, PopulationByGender>
export type PopulationByGender = Record<Gender, number>

export const populationByYear: PopulationByYear = {
  1980: { female: 5520754, male: 5188709 },
  1990: { female: 5389919, male: 4984904 },
  2001: { female: 5349286, male: 4851012 },
  2012: { female: 5207259, male: 4724666 },
  2013: { female: 5182225, male: 4713025 },
  2014: { female: 5152770, male: 4697447 },
  2015: { female: 5128422, male: 4687436 },
  2016: { female: 5101174, male: 4678478 },
  2017: { female: 5076104, male: 4663753 },
  2018: { female: 5054972, male: 4658683 },
  2019: { female: 5039416, male: 4660856 },
  2020: { female: 5025500, male: 4663876 },
  2021: { female: 5004102, male: 4647359 },
  2022: { female: 4981528, male: 4628875 },
  2023: { female: 4974484, male: 4625260 },
  2024: { female: 4961249, male: 4623378 },
};

export const populationByYearWithApproximations = sortObjectByKeys(fillWithApproximations(populationByYear));

export const totalPopulationByYear = Object.entries(populationByYear)
  .reduce((acc, [year, pop]) => ({
    ...acc,
    [+year]: pop['male'] + pop['female'],
  }), {} as Record<number, number>);

export function getPopulationByYear(year: number, gender: Gender): number {
  return populationByYear[year][gender];
}

const years = Object.keys(populationByYear).map(Number);
export function getTotalPopulation() {
  return years.reduce((acc, year) => ({
    ...acc,
    [year]: totalPopulationByYear[+year]
  }), {} as Record<number, number>)
}

export function getTotalPopulationByYear(year: number): number {
  return totalPopulationByYear[year];
}

/**
 * Calculates the replacement rate for each year based on the total population.
 * 
 * The replacement rate is computed by dividing the total population of each year
 * by itself and formatting the result to two significant digits.
 */
export const replacementRate: Record<number, number> = years
  .reduce((acc, year) => {
    return {
      ...acc,
      [+year]: +(getTotalPopulationByYear(year) / getTotalPopulationByYear(year)).toPrecision(2),
    }
  }, {} as Record<number, number>)

export const replacementRateByYear = (year: number) => replacementRate[year];

/**
 * Returns an approximation of the population for a given year by gender based on previously accumulated population data.
 * The approximation is calculated based on the population data of the nearest previous and next years.
 * If there is no previous or next year data available, the function returns `null`.
 */
export function getApproximation(acc: PopulationByYear, year: number): PopulationByYear[number] | null {
  const years = new Set(Object.keys(acc).map(Number));
  if (years.has(year)) {
    return null;
  }
  const previousYear = Math.max(...[...years].filter(y => y < year));
  const nextYear = Math.min(...[...years].filter(y => y > year));

  if (!previousYear || !nextYear) {
    return null;
  }

  const previousData = acc[previousYear];
  const nextData = acc[nextYear];

  const interpolate = (prev: number, next: number) => prev + (next - prev) * ((year - previousYear) / (nextYear - previousYear));

  const approx = {
    female: Math.round(interpolate(previousData.female, nextData.female)),
    male: Math.round(interpolate(previousData.male, nextData.male)),
  };
  return approx;
}

/**
 * Fills the given population data with approximations for the missing years.
 */
export function fillWithApproximations(recordedPopulation: PopulationByYear): PopulationByYear {
  if (Object.keys(recordedPopulation).length < 2) {
    console.error('Not enough data to fill with approximations');
    return recordedPopulation;
  }

  let approximations: PopulationByYear = {};

  let years = Object.keys(recordedPopulation).map(Number);
  let year = years[0];
  let lastYear = years[years.length - 1];

  while (year <= lastYear) {
    const approx = getApproximation(recordedPopulation, year);
    if (approx) {
      approximations[year] = approx;
    }
    year++;
  };

  return {
    ...recordedPopulation,
    ...approximations,
  };
}

/**
 * Calculate future population data by gender based on past data points and replacement rate trends.
 * @param pastPopulation
 * @param futureNumberOfYears 
 */
export function extrapolateFuturePopulation(pastPopulation: PopulationByYear, futureNumberOfYears: number, birthRateFromPastYear: number): PopulationByYear {
  const futurePopulation: PopulationByYear = { ...pastPopulation };
  const years = Object.keys(pastPopulation).map(Number);
  const lastRecordedYear = Math.max(...years);

  for (let i = 1; i <= futureNumberOfYears; i++) {
    const year = lastRecordedYear + i;
    const previousYearPopulation = futurePopulation[year - 1];
    const newPopulationFemale = previousYearPopulation.female * birthRateFromPastYear;
    const newPopulationMale = previousYearPopulation.male * birthRateFromPastYear;
    futurePopulation[year] = {
      female: Math.round(newPopulationFemale),
      male: Math.round(newPopulationMale),
    };
  }

  return futurePopulation;
}

function calculatePastPopulationGrowthRates<TStructure = { population: number, growthRate: number }, TResult = Record<number, TStructure>>(population: PopulationByYear): TResult {
  return Object.keys(population).reduce((acc, y, i) => {
    const year = +y;
    if (i === 0) return acc;
    const populationOfPrevYear = population[year - 1].female + population[year - 1].male;
    const populationOfYear = population[year].female + population[year].male;
    let growthRate = populationOfYear / populationOfPrevYear;
    if (growthRate > 1) {
      growthRate = +growthRate.toPrecision(5) * 100;
    } else {
      growthRate = -(100 - (+growthRate.toPrecision(5) * 100));
    }
    return {
      ...acc,
      [year]: { population: populationOfYear, growthRate: +growthRate.toPrecision(5) },
    }
  }, {} as TResult);
}

export const pastPopulatioinGrowthRates = calculatePastPopulationGrowthRates(populationByYearWithApproximations);