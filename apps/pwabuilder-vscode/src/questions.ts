import { Question } from "./interfaces";

export const packageQuestion: Question = {
  type: "list",
  name: "platform",
  message: "Which platform did you want to package your app for?",
  choices: ["Windows Development", "Windows Production", "Android", "iOS"],
  default: "Windows Development",
};

export const windowsDevQuestions: Array<Question> = [
  {
    type: "input",
    name: "url",
    message: "What is the URL of your app?",
    default: "https://webboard.app",
  },
  {
    type: "input",
    name: "name",
    message: "What is the name of your app?",
    default: "pwa-starter",
  },
];

export const windowsProdQuestions: Array<Question> = [
  {
    type: "input",
    name: "url",
    message: "What is the URL of your app?",
    default: "https://webboard.app",
  },
  {
    type: "input",
    name: "name",
    message: "What is the name of your app?",
    default: "pwa-starter",
  },
  {
    type: "input",
    name: "packageId",
    message: "What is the package ID of your app?",
  },
  {
    type: "input",
    name: "version",
    message: "What is the version number of your app? Example: 1.0.1?",
    default: "1.0.1",
  },
  {
    type: "input",
    name: "classicVersion",
    message:
      "What should the version number be for the classic package? This must be lower than the main version number. Example: 1.0.0?",
    default: "1.0.0",
  },
  {
    type: "input",
    name: "displayName",
    message: "What is your publisher display name?",
  },
  {
    type: "input",
    name: "publisherId",
    message: "What is your publisher ID?",
  },
];
