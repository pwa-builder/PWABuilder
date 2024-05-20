import os from 'os';
import * as fs from 'fs';
import { doesFileExist } from '../util/fileUtil';
import { PWABuilderData, createUserDataAndWrite } from '../analytics/usage-analytics';
import { outputMessage } from './util';
import { formatCodeSnippet, formatEmphasis, formatEmphasisStrong } from './textUtil';
import * as prompts from "@clack/prompts";

const whisperDisplayText: string = formatCodeSnippet(`${formatEmphasis("Want to start using AI on the web?")} We just added a new starter template!
The new whisper template includes a Whisper transcription model to get you started with building AI-empowered progressive web apps!
Run ${formatEmphasisStrong("pwa create -t=whisper myWhisperPWA")} to pull the new template.
`);

export var WHISPER_CAMPAIGN: Campaign = {
    name: "whisper",
    displayed: false,
    displayText: whisperDisplayText 
}

export type Campaign = {
    name: string,
    displayed: boolean,
    displayText: string
}

export type CampaignMap = {
    [key: string] : Campaign
}


export function handleCampaign(campaign: Campaign) {
    const pwabuilderDataFilePath: string = os.homedir() + "/.pwabuilder";
    var userData: PWABuilderData;
    if(doesFileExist(pwabuilderDataFilePath)) {
        userData = JSON.parse(fs.readFileSync(pwabuilderDataFilePath, {encoding: 'utf-8'}));
    } else {
        userData = createUserDataAndWrite(pwabuilderDataFilePath);
    }

    handleShowCampaign(userData, campaign);
}

function doesCampaignExist(userData: PWABuilderData, campaignKey: string) {
    return userData.campaignMap && campaignKey in userData.campaignMap;
}

function addCampaign(userData: PWABuilderData, campaign: Campaign): PWABuilderData {
    if(doesCampaignExist(userData, campaign.name)) {
        return userData;
    }

    if(!userData.campaignMap) {
        userData.campaignMap = {};
    }
    userData.campaignMap[campaign.name] = campaign;
    
    return userData;
}

function handleShowCampaign(userData: PWABuilderData, campaign: Campaign) {
    var userDataWithCampaign: PWABuilderData = addCampaign(userData, campaign);
    if(userDataWithCampaign.campaignMap && !userDataWithCampaign.campaignMap[campaign.name].displayed) {
        outputMessage(campaign.displayText);
        campaign.displayed = true;
        userDataWithCampaign.campaignMap[campaign.name] = campaign;
        rewritePWABuilderDataFile(userDataWithCampaign)
    }
}

function rewritePWABuilderDataFile(userData: PWABuilderData) {
    const pwabuilderDataFilePath: string = os.homedir() + "/.pwabuilder";
    fs.writeFileSync(pwabuilderDataFilePath, JSON.stringify(userData), {encoding: 'utf-8'});
}