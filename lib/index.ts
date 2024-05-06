import yaml from "js-yaml";
import {
  replaceVariables,
  transferObjToList,
  functionParser,
  getUuid,
  getValueByPath,
  delay,
  validateParams,
} from "./utils/common/index.js";
import { ListItem } from "./utils/common/transferObjToList.js";
import {
  interactContractEvm,
  interactContractSolana,
} from "./utils/interactContract/index.js";
import { publicVariable } from "./config/index.js";

export interface logItem {
  type: "start" | "end" | "params" | "action" | "error";
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
  setActionNetwork: any;
  setLogs: any;
  constructor(
    bql: string,
    abiOrIdl: Record<string, any[] | Record<string, any>>,
    setActionNetwork: any,
    solanaRpc?: string,
    params?: any,
    setLogs?: any
  ) {
    this.bql = bql;
    const bqlObj = yaml.load(bql);
    const wrapObj = { ...publicVariable, ...bqlObj };
    this.context = wrapObj;
    this.abiOrIdl = abiOrIdl;
    this.setActionNetwork = setActionNetwork;
    this.setLogs = setLogs;
    this.solanaRpc = solanaRpc || "";
    this.uuid = getUuid();
    this.executeList = transferObjToList(this.context);
    const error = validateParams(this.context, params);
    if (error) {
      // params log
      const paramsLog: logItem = {
        type: "params",
        timeStamp: Date.now(),
        runId: this.uuid,
        code: this.context.params,
        message: error,
      };
      this.setLogs && this.setLogs((state: any) => [...state, paramsLog]);
      throw new Error(error);
    }
    if (this.context.params && params) {
      this.context.params = params;
    }
  }
  async run(
    provider: any,
    account: string,
    step = 0,
    continuousExecution = true
  ) {
    try {
      this.context["ADDRESS"] = account;
      if (step >= this.executeList.length) {
        // end log
        const endLog: logItem = {
          type: "end",
          timeStamp: Date.now(),
          runId: this.uuid,
          code: this.executeList[step - 1],
          message: "Workflow stop running.",
        };
        this.setLogs && this.setLogs((state: any) => [...state, endLog]);
        return;
      }

      this.currentStep = step;
      if (this.isPause) return;
      if (this.isStop) {
        this.isStop = false;
        return;
      }

      //start log
      const startLog: logItem = {
        type: "start",
        timeStamp: Date.now(),
        runId: this.uuid,
        code: this.executeList[step],
        message: "Workflow start running.",
      };
      this.setLogs &&
        this.setLogs((state: any) => {
          const notStart =
            state.find((item: any) => item.type === "start") === undefined;
          const returnLogs = [...state];
          if (notStart) returnLogs.push(startLog);
          return returnLogs;
        });

      const { key, value, path } = this.executeList[step];
      // replace variables
      if (typeof value === "string" && value.startsWith("$")) {
        replaceVariables(key, value, path, this.context);
      }

      // function parsing
      if (typeof key === "string" && key.startsWith("_")) {
        await functionParser(key, path, this.context, this.abiOrIdl);
      }

      // return network
      if (key === "network") {
        this.setActionNetwork(value);
        await delay(100);
      }

      // interact contract
      if (key === "action") {
        const pathValue = getValueByPath(this.context, path);
        const action = pathValue && pathValue[key];
        if (action?.network === "solana") {
          await interactContractSolana(
            action,
            this.abiOrIdl,
            provider,
            this.solanaRpc,
            this.setLogs,
            this.uuid
          );
        } else {
          await interactContractEvm(
            action,
            this.context,
            this.abiOrIdl,
            provider,
            account,
            this.setLogs,
            this.uuid
          );
        }
      }

      if (continuousExecution) {
        const nextStep = step + 1;
        await this.run(provider, account, nextStep);
      }
    } catch (error: any) {
      // error log
      const errorLog: logItem = {
        type: "error",
        timeStamp: Date.now(),
        runId: this.uuid,
        code: this.executeList[this.currentStep],
        message: error?.data?.message || error?.message || error,
      };
      this.setLogs &&
        this.setLogs((state: any) => {
          const notStart =
            state.find((item: any) => item.type === "error") === undefined;
          const returnLogs = [...state];
          if (notStart) returnLogs.push(errorLog);
          return returnLogs;
        });

      // end log
      const endLog: logItem = {
        type: "end",
        timeStamp: Date.now(),
        runId: this.uuid,
        code: this.executeList[this.currentStep],
        message: "Workflow stop running.",
      };
      this.setLogs &&
        this.setLogs((state: any) => {
          const notStart =
            state.find((item: any) => item.type === "error") === undefined;
          const returnLogs = [...state];
          if (notStart) returnLogs.push(endLog);
          return returnLogs;
        });
      // throw the bottom-level message
      throw new Error(error?.data?.message || error?.message || error);
    }
  }
  pause() {
    this.isPause = true;
  }
  async resume(provider: any, account: string) {
    this.isPause = false;
    await this.run(provider, account, this.currentStep);
  }
  stop() {
    this.isStop = true;
  }
}
