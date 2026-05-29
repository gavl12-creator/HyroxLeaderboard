import type { Athlete, StationKey, StationSplit } from "./types";

export const stationDefinitions = [] as any;

const firstNames = ["Ava","Noah","Mia","Leo","Grace","Oscar","Freya","Ethan","Ruby","Theo","Sofia","Lucas","Ella","Max","Isla","Finn","Amelia","Jack","Chloe","Mason","Lily","Harry","Nora","Adam","Evie","Ben","Zara","Sam","Maisie","Josh","Hannah","Ryan","Ivy","Caleb","Poppy","Owen","Florence","Alex","Emma","Dylan","Olivia","Jude","Millie","Kai","Alice","Tom","Harper","Rory","Lola","Nathan"];
const lastNames = ["Morgan","Reid","Carter","Hughes","Patel","Walker","Morris","Bennett","Turner","Collins","Foster","Price","Hayes","Cooper","Ward","Brooks","Bailey","Parker","Russell","Kelly","Wright","Gray","Murray","Powell","Knight","Webb","Fisher","Stone","Dixon","Wells","Grant","Palmer","Fox","Harrison","Gibson","Cole","Hudson","West","Porter","Shaw","Hunter","Mills","Rose","Wood","Barnes","Lane","Marsh","Atkinson","Lawson","Hardy"];
const ageGroups = ["18-24","25-29","30-34","35-39","40-44","45-49"];
const divisions: Athlete['division'][] = ["Open","Open","Open","Pro","Doubles"];
const gyms = ["Foundry Performance","North Dock Fitness","Engine Room","Rep Yard","Metro Endurance"];
function slugify(v:string){return v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
export const athletes: Athlete[] = Array.from({length:50},(_,index)=>({id:index+1,slug:slugify(`${firstNames[index]} ${lastNames[(index*7)%lastNames.length]}`),name:`${firstNames[index]} ${lastNames[(index*7)%lastNames.length]}`,bib:1201+index,ageGroup:ageGroups[index%ageGroups.length],division:divisions[index%divisions.length],weightDivision:index%4===0||divisions[index%divisions.length]==='Pro'?'Pro Weights':'Open Weights',gym:gyms[index%gyms.length],avatarHue:(index*39)%360,averageHeartRate:170,maxHeartRate:190,redZonePercent:30,completionScore:90,splits:[]}));
