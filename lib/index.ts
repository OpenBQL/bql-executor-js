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
  abiOrIdl: Record<string, any[] | Record<string, any>> = {};
  solanaRpc: string = "";
  currentStep: number = 0;
  isPause: boolean = false;
  isStop: boolean = false;
  uuid: string = "";
  logs: logItem[] = [];
  constructor(
    bql: string,
    abiOrIdl: Record<string, any[] | Record<string, any>>,
    provider: any,
    account: string,
    solanaRpc?: string
  ) {
    this.bql = bql;
    const bqlObj = yaml.load(bql);
    const wrapObj = { ADDRESS: account, ...publicVariable, ...bqlObj };
    this.context = wrapObj;
    this.abiOrIdl = abiOrIdl;
    this.provider = provider;
    this.account = account;
    this.solanaRpc = solanaRpc || "";
    this.uuid = getUuid();
    this.executeList = transferObjToList(this.context);
  }
  async run(setNetwork: any, step = 0, continuousExecution = true) {
    try {
      if (step >= this.executeList.length) {
        this.logs.push({
          type: "end",
          timeStamp: Date.now(),
          runId: this.uuid,
          code: this.executeList[step - 1],
          message: "Workflow stop running.",
        });
        return;
      }
      this.currentStep = step;
      if (this.isPause) return;
      if (this.isStop) {
        this.isStop = false;
        return;
      }

      const notStart =
        this.logs.find((item) => item.type === "start") === undefined;
      if (notStart) {
        this.logs.push({
          type: "start",
          timeStamp: Date.now(),
          runId: this.uuid,
          code: this.executeList[step],
          message: "Workflow start running.",
        });
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

      // return network
      if (key === "network") {
        setNetwork(value);
      }

      // interact contract
      if (key === "action") {
        if (this.context.network === "solana") {
          await interactContractSolana(
            key,
            path,
            this.context,
            this.abiOrIdl,
            this.provider,
            this.solanaRpc,
            this.logs,
            this.uuid
          );
        } else {
          await interactContractEvm(
            key,
            path,
            this.context,
            this.abiOrIdl,
            this.provider,
            this.account,
            this.logs,
            this.uuid
          );
        }
      }

      if (continuousExecution) {
        step += 1;
        await this.run(step);
      }
    } catch (error: any) {
      const notError =
        this.logs.find((item) => item.type === "error") === undefined;
      notError &&
        this.logs.push({
          type: "error",
          timeStamp: Date.now(),
          runId: this.uuid,
          code: this.executeList[this.currentStep],
          message: error?.data?.message || error?.message || error,
        });
      const notEnd =
        this.logs.find((item) => item.type === "end") === undefined;
      notEnd &&
        this.logs.push({
          type: "end",
          timeStamp: Date.now(),
          runId: this.uuid,
          code: this.executeList[this.currentStep],
          message: "Workflow stop running.",
        });
      // throw the bottom-level message
      throw new Error(error?.data?.message || error?.message || error);
    }
  }
  pause() {
    this.isPause = true;
  }
  resume() {
    this.isPause = false;
    this.run(this.currentStep);
  }
  stop() {
    this.isStop = true;
  }
}
