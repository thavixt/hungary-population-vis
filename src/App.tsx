import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine, TooltipProps } from "recharts";
import { populationByYearWithApproximations, pastPopulatioinGrowthRates, populationByYear, extrapolateFuturePopulation } from "./logic/population"
import { useCallback, useMemo, useState } from "react";

const DATA_POINTS = Object.entries(populationByYear);
const LAST_DATA_POINT = Object.fromEntries([DATA_POINTS[DATA_POINTS.length - 1]]);

const series = [
  {
    name: 'Approximate population - male',
    data: Object.entries(populationByYearWithApproximations).map(([year, { male }]) => ({
      category: year,
      value: male,
    })),
    stroke: 'lightblue',
  },
  {
    name: 'Approximate population - female',
    data: Object.entries(populationByYearWithApproximations).map(([year, { female }]) => ({
      category: year,
      value: female,
    })),
    stroke: 'orange',
  },
  {
    name: 'Approximate population - total',
    data: Object.entries(populationByYearWithApproximations).map(([year, { male, female }]) => ({
      category: year,
      value: male + female,
    })),
    stroke: 'red',
  },
];

const birthRateSeries = [
  {
    name: 'Population growth rate',
    data: Object.entries(pastPopulatioinGrowthRates).map(([year, { growthRate }]) => ({
      category: year,
      value: growthRate,
    })),
    stroke: 'cyan',
  },
]

function App() {
  const [rate, setRate] = useState(0.99876);

  const getTooltip = useCallback((props: TooltipProps<number, string>) => {
    const payload = props.payload?.[0]?.payload;
    if (!payload) return;
    return (
      <div className='flex flex-col border rounded-md p-2 bg-slate-800 text-g'>
        <p>{props.label}</p>
        {props.payload?.map(p => {
          return (
            <div key={p.name} className="flex space-x-2">
              <p>{p.name}: <b>{p.payload.value}</b></p>
            </div>
          )
        })}
      </div>
    )
  }, [])

  const future = useMemo(() => {
    return {
      name: `Future population with ${rate}% growth rate`,
      data: Object.entries(extrapolateFuturePopulation(LAST_DATA_POINT, 100, rate)).map(([year, { male, female }]) => ({
        category: year,
        value: male + female,
      })),
      stroke: 'green',
    };
  }, [rate]);

  const percent = useMemo(() => {
    let ratePercent = rate;
    if (rate > 1) {
      ratePercent = rate * 100 - 100;
    } else {
      ratePercent = rate * 100 - 100
    }
    return ratePercent.toPrecision(3);
  }, [rate])

  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center">
        <h1>Population trends of Hungary</h1>
        <div className="flex flex-col space-y-1">
          <p>Data from <a target="__blank" href="https://www.ksh.hu/stadat_files/nep/hu/nep0003.html">KSH</a></p>
          <span>Set a future population growth rate:</span>
          <div className="flex flex-col space-y-2 items-center">
            <input
              className="inline w-40"
              defaultValue={rate}
              id="rate"
              max={2}
              min={0}
              name="rate"
              onChange={e => setRate(+e.target.value)}
              step={0.0001}
              type="number"
            />
            <span>Future yearly population growth: <b>{percent}%</b></span>
          </div>
        </div>
        <div className="w-max h-fit flex flex-col items-center space-y-16">
          <LineChart width={500} height={300}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="category" type="category" allowDuplicatedCategory={false} />
            <YAxis dataKey="value" tickFormatter={(value) => value ? `${Math.round(value / 1000)}k` : ''} />
            <Legend />
            <Tooltip content={getTooltip} />
            {[...series, future].map((s) => (
              <Line dataKey="value" data={s.data} name={s.name} key={s.name} stroke={s.stroke} dot={false} isAnimationActive={false} />
            ))}
          </LineChart>
          <LineChart width={500} height={300}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="category" type="category" allowDuplicatedCategory={false} />
            <YAxis dataKey="value" domain={[-1, 1]} />
            <Legend />
            <Tooltip content={getTooltip} />
            {birthRateSeries.map((s) => (
              <Line dataKey="value" data={s.data} name={s.name} key={s.name} stroke={s.stroke} dot={false} />
            ))}
            <ReferenceLine y={0} label="Replacement rate - 0" stroke="red" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={0.95} label="Cyprus - 0.95" stroke="orange" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={0.75} label="Switzerland - 0.75" stroke="purple" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={0.59} label="Norway - 0.59" stroke="green" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={0.2} label="France - 0.2" stroke="lightblue" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={-0.46} label="Croatia - -0.46" stroke="pink" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={-0.94} label="Romania - -0.94" stroke="yellow" strokeDasharray="3 3" opacity={0.5} />
          </LineChart>
        </div>
        <div>
          <a href="https://github.com/thavixt/hungary-population-vis/">github</a>
        </div>
      </div>
    </>
  )
}

export default App
