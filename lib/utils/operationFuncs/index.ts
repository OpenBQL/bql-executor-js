import add from "./add";
import minus from "./minus";
import mul from "./mul";
import floor from "./floor";
import divide from "./divide";
import ceil from "./ceil";
import max from "./max";
import min from "./min";
import mod from "./mod";
import round from "./round";
import gt from "./gt";
import gte from "./gte";
import lt from "./lt";
import lte from "./lte";
import eq from "./eq";

const funcs: Record<string, any> = {
  add,
  minus,
  mul,
  floor,
  divide,
  ceil,
  max,
  min,
  mod,
  round,
  gt,
  gte,
  lt,
  lte,
  eq,
};

export default funcs;
