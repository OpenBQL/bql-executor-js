import yaml from "js-yaml";
import {
  replaceVariables,
  transferObjToList,
  functionParser,
  getUuid,
} from "./utils/common";
import { ListItem } from "./utils/common/transferObjToList";
import {
  interactContractEvm,
  interactContractSolana,
} from "./utils/interactContract";
import { publicVariable } from "./config";

export interface logItem {
  type: "start" | "end" | "action" | "error";
  timeStamp: number;
  runId: string;
  code: any;
  message: string;
}

export class Executor {
  bql = "";
  context: Record<string, any> = {};
  executeList: ListItem[] = [];
  provider: any = null;
  account: string = "";
  solanaRpc: string = "";
  currentStep: number = 0;
  logs: logItem[] = [];
  constructor(bql: string, provider: any, account: string, solanaRpc?: string) {
    this.bql = bql;
    const bqlObj = yaml.load(bql);
    const wrapObj = { ADDRESS: account, ...publicVariable, ...bqlObj };
    this.context = wrapObj;
    this.provider = provider;
    this.account = account;
    this.solanaRpc = solanaRpc || "";
    this.executeList = transferObjToList(this.context);
  }
  async run(step = 0, continuousExecution = true) {
    try {
      if (step >= this.executeList.length) {
        this.logs.push({
          type: "end",
          timeStamp: Date.now(),
          runId: getUuid(),
          code: this.executeList[step - 1],
          message: "Workflow stop running.",
        });
        return;
      }
      const notStart =
        this.logs.find((item) => item.type === "start") === undefined;
      if (notStart) {
        this.logs.push({
          type: "start",
          timeStamp: Date.now(),
          runId: getUuid(),
          code: this.executeList[step],
          message: "Workflow start running.",
        });
      }

      this.currentStep = step;

      const { key, value, path } = this.executeList[step];
      // replace variables
      if (typeof value === "string" && value.startsWith("$")) {
        replaceVariables(key, value, path, this.context);
      }

      // function parsing
      if (typeof key === "string" && key.startsWith("_")) {
        functionParser(key, path, this.context);
      }

      // interact contract
      if (key === "action") {
        if (this.context.network === "solana") {
          await interactContractSolana(
            key,
            path,
            this.context,
            this.provider,
            this.solanaRpc,
            this.logs
          );
        } else {
          await interactContractEvm(
            key,
            path,
            this.context,
            this.provider,
            this.account,
            this.logs
          );
        }
      }

      if (continuousExecution) {
        step += 1;
        await this.run(step);
      }
    } catch (error: any) {
      console.log("xxxx");
      this.logs.push({
        type: "error",
        timeStamp: Date.now(),
        runId: getUuid(),
        code: this.executeList[this.currentStep],
        message: error?.data?.message || error?.message || error,
      });
      this.logs.push({
        type: "end",
        timeStamp: Date.now(),
        runId: getUuid(),
        code: this.executeList[this.currentStep],
        message: "Workflow stop running.",
      });
      // throw the bottom-level message
      throw new Error(error?.data?.message || error?.message || error);
    }
  }
}
