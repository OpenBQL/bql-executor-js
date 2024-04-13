import yaml from "js-yaml";
import { ListItem, replaceVariables, transferObjToList } from "./utils/common";

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

    // The first step is variable substitution
    if (typeof value === "string" && value.startsWith("$")) {
      replaceVariables(key, value, path, this.context);
    }

    if (continuousExecution) {
      step += 1;
      this.run(step);
    }
  }
}
