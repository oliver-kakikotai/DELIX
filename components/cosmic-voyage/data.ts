import { albumData } from '@/data/albumData';

export const starField = Array.from({ length: 96 }, (_, i) => ({
  left: (i * 47 + 11) % 100,
  top: (i * 83 + 19) % 100,
  size: 1 + ((i * 13) % 3),
  opacity: 0.22 + ((i * 17) % 55) / 100,
}));

export const flightPaths = [
  {
    x: ['-72vw', '-42vw', '-30vw', '-30vw', '-74vw'],
    y: ['-46vh', '-18vh', '0vh', '0vh', '46vh'],
    scale: [0.06, 0.86, 3.28, 3.28, 0.12],
    range: [0.22, 0.255, 0.29, 0.34, 0.37],
    infoPlacement: 'right',
  },
  {
    x: ['76vw', '42vw', '31vw', '31vw', '76vw'],
    y: ['-42vh', '-16vh', '-1vh', '-1vh', '40vh'],
    scale: [0.06, 0.78, 3.12, 3.12, 0.12],
    range: [0.38, 0.415, 0.45, 0.5, 0.53],
    infoPlacement: 'left',
  },
  {
    x: ['-54vw', '-24vw', '-2vw', '-2vw', '58vw'],
    y: ['58vh', '26vh', '4vh', '4vh', '-42vh'],
    scale: [0.06, 0.9, 3.36, 3.36, 0.14],
    range: [0.54, 0.575, 0.61, 0.66, 0.69],
    infoPlacement: 'right',
  },
  {
    x: ['78vw', '38vw', '24vw', '24vw', '-48vw'],
    y: ['44vh', '17vh', '0vh', '0vh', '-38vh'],
    scale: [0.06, 0.82, 3.18, 3.18, 0.12],
    range: [0.7, 0.735, 0.77, 0.82, 0.85],
    infoPlacement: 'left',
  },
  {
    x: ['8vw', '2vw', '-20vw', '-20vw', '-118vw'],
    y: ['-64vh', '-24vh', '0vh', '0vh', '72vh'],
    scale: [0.05, 0.76, 3.05, 3.05, 0.04],
    range: [0.86, 0.895, 0.915, 0.94, 0.965],
    infoPlacement: 'right',
  },
];

export type VoyageSong = (typeof albumData.songs)[number] & {
  unlocked: boolean;
  path: (typeof flightPaths)[number];
};

export type LockedMission = {
  title: string;
  toolName: string;
  toolImage?: string;
  clue: string;
};

export const missionPrinciples = [
  {
    label: '01 / ALBUM WORLD',
    title: 'Songs are planets',
    text: 'Every DELIX track is treated as a place in orbit, not a flat item in a list.',
  },
  {
    label: '02 / SIGNAL TOOLS',
    title: 'Locked songs need keys',
    text: 'Hidden tracks open when the listener collects the matching signal tool.',
  },
  {
    label: '03 / ARCHIVE MEMORY',
    title: 'The IP is discovered in pieces',
    text: 'Lyrics, tools, visual fragments, and song pages build the Runaway Rabbit universe over time.',
  },
];

export const signalTools = [
  {
    id: 5,
    songId: 1,
    name: 'COSMIC AMPLIFIER',
    unlocksSong: 'Tomorrow',
    image: '/images/egg.png',
    clue: 'Recovered in the final transmission after the first orbit pass.',
  },
  {
    id: 1,
    songId: 2,
    name: 'STELLAR NAVIGATOR',
    unlocksSong: 'The Real Reason',
    image: '/images/NS.png',
    clue: 'Found in the navigation log where the route first breaks open.',
  },
  {
    id: 3,
    songId: 4,
    name: 'TEMPORAL DECODER',
    unlocksSong: 'Salmon and Potatoes',
    image: '/images/stone.png',
    clue: 'Buried in a memory fragment from the archive corridor.',
  },
  {
    id: 4,
    songId: 5,
    name: 'ASCENSION CORE',
    unlocksSong: 'The Ascension',
    image: '/images/diamond.png',
    clue: 'Held at the far edge of the ship log, close to the exit vector.',
  },
];

export type SignalTool = (typeof signalTools)[number];
