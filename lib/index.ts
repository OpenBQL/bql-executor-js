import yaml from "js-yaml";
import {
  replaceVariables,
  transferObjToList,
  functionParser,
} from "./utils/common";
import { ListItem } from "./utils/common/transferObjToList.js";
export class Executor {
  bql = "";
  context: Record<string, any> = {};
  executeList: ListItem[] = [];
  constructor(bql: string) {
    this.bql = bql;
    this.context = yaml.load(bql);
    this.executeList = transferObjToList(this.context);
  }
  run(step = 0, continuousExecution = true) {
    if (step >= this.executeList.length) {
      return;
    }
    const { key, value, path } = this.executeList[step];
    // replace variables
    if (typeof value === "string" && value.startsWith("$")) {
      replaceVariables(key, value, path, this.context);
    }

    // function parsing
    if (typeof key === "string" && key.startsWith("_")) {
      functionParser(key, path, this.context);
    }

    if (continuousExecution) {
      step += 1;
      this.run(step);
    }
  }
}
