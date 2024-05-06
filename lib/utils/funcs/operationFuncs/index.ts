import add from "./add.js";
import minus from "./minus.js";
import mul from "./mul.js";
import floor from "./floor.js";
import divide from "./divide.js";
import ceil from "./ceil.js";
import max from "./max.js";
import min from "./min.js";
import mod from "./mod.js";
import round from "./round.js";
import gt from "./gt.js";
import gte from "./gte.js";
import lt from "./lt.js";
import lte from "./lte.js";
import eq from "./eq.js";

const operationFuncs: Record<string, any> = {
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

export default operationFuncs;
