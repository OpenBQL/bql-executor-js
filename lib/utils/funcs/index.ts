import operationFuncs from "./operationFuncs/index.js";
import solanaFuncs from "./solanaFuncs/index.js";

const funcs: Record<string, any> = { ...operationFuncs, ...solanaFuncs };

export default funcs;
