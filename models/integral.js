const arangoDb = require("./arangoDb.js")
var config = require('../config')
const logger = require('../utils/logger').logger('integral');
const postJson = require('../utils/postjson');

const integralCollection = "userIntegral"

//////////////////////////////////////////////////////////////////
function getlocalDateString(){
    var myDate = new Date()
    return myDate.toLocaleDateString()
}

function getlocalTimeString(){
    return new Date().toLocaleString()
}

//////////////////////////////////////////////////////////////////
function getTimeStamp(){
    var date = new Date()
    return parseInt(date.getTime() / 1000)
}

//////////////////////////////////////////////////////////////////
async function buildDoc(darwinId){
    var totalScore = 10000
    var doc = {}
    doc._key = darwinId
    doc.timestamp = getTimeStamp()
    doc.createTime = getlocalTimeString()
    doc.login = []
    doc.dictation = []
    doc.course = []
    doc.horoscope = []
    doc.survey = []
    doc.nongli = []
    doc.luckyDraw = []
    doc.shareEvent = []
    doc.state = "active"
    doc.totalScore = totalScore
    doc.usedScore = 0
    return doc
}

//////////////////////////////////////////////////////////////////
async function startIntegral(openId){
    var queryAql = `for doc in ${integralCollection}  filter doc._key == '${openId}' return doc`
    var doc = await arangoDb.querySingleDoc(queryAql)
    if(doc == null){
        var userIntegral = await buildDoc(openId)
        logger.info("user integral ", userIntegral)
        await arangoDb.saveDoc(integralCollection, userIntegral)
        return true
    }
    var updateAql = `LET doc = DOCUMENT("${integralCollection}/${openId}")
    update doc with {
       state : 'active'
    } in ${integralCollection}`
    await arangoDb.updateDoc(updateAql)
    return true
}

//////////////////////////////////////////////////////////////////
async function stopIntegral(openId){
    var updateAql = `LET doc = DOCUMENT("${integralCollection}/${openId}")
    update doc with {
        state : 'inActive'
    } in ${integralCollection}`
    return await arangoDb.updateDoc(updateAql)
}

//////////////////////////////////////////////////////////////////
async function addIntegalInfo(openId){
    var queryAql = `for doc in ${integralCollection}  filter doc._key == '${openId}' return doc`
    var doc = await arangoDb.querySingleDoc(queryAql)
    if(doc == null){
        var userIntegral = await buildDoc(openId)
        logger.info("user integral ", userIntegral)
        await arangoDb.saveDoc(integralCollection, userIntegral)
    }
    return true
}

//////////////////////////////////////////////////////////////////
var _event_score_rule={
    "login": [
        { start: 1,
          end: 6,
          score:  10},
        { start: 7,
          end: 20,
          score:  20},
        { start: 21,
          end: 100000,
          score:  20}
    ],
    "dictation": [
        { start: 1,
          end: 100000,
          score:  20}
    ],
    "luckyDraw" : [
        { start: 1,
           end: 100000,
           score:  100}
    ],
    "shareEvent" : [
        { start: 1,
            end: 100000,
            score:  10}
    ]
}

//////////////////////////////////////////////////////////////////
function clacAddScore(event, lastDay){
    if(event in  _event_score_rule){
        var matchRules = _event_score_rule[event].filter(rule =>{
            return rule.start <= lastDay && rule.end >= lastDay
        })
        if(matchRules.length == 0){
            return 10
        }
        return matchRules[0].score
    }
    return 0
}

//////////////////////////////////////////////////////////////////
function buildLastEventItem(event, lastDay, eventInfo){
    var doc = {}
    doc.day = getlocalDateString()
    doc.time = getlocalTimeString()
    doc.name = event
    doc.lastDay = lastDay
    Object.assign(doc, eventInfo)
    return JSON.stringify(doc)
}

//////////////////////////////////////////////////////////////////
async function doUpdateIntegal(event, openId, lastDay, eventInfo){
    var addScore = clacAddScore(event, lastDay)
    var lastEventItem = buildLastEventItem(event, lastDay,eventInfo)
    var updateAql = `LET doc = DOCUMENT("${integralCollection}/${openId}")
                    update doc with {
                        ${event}: APPEND(doc.${event}, ${lastEventItem}),
                        totalScore: doc.totalScore + ${addScore}
                    } in ${integralCollection}`
    return await arangoDb.updateDoc(updateAql)
}

//////////////////////////////////////////////////////////////////
async function addDayStat(event, openId){
    var today = getlocalDateString()
    var queryAql = `for doc in ${integralCollection} 
    filter doc._key == '${openId}'
    return LAST(doc.${event})`
    var doc = await arangoDb.querySingleDoc(queryAql)
    if(doc == null){
        return await doUpdateIntegal(event, openId, 1, {})
    }
    if(doc.day == today){
        return true
    }
    return await doUpdateIntegal(event, openId, doc.lastDay + 1, {})
}

//////////////////////////////////////////////////////////////////
async function statByResponse(userId, response){
    var ret = response.msgs.filter(msg => {
        return msg.type == "redirect" && msg.url == "dictation"
    })
    if (ret.length > 0){
        await addDayStat("dictation", userId)
    }
}

//////////////////////////////////////////////////////////////////
async function addNewDictationStat(userId){
    await addDayStat("dictation", userId)
}

//////////////////////////////////////////////////////////////////
async function textChatStat(request, response){
    // await statByResponse(request.session, response)
    return true
}

//////////////////////////////////////////////////////////////////
async function eventChatStat(request, response){
    var eventName = request.event.name
    var userId = request.session
    if(eventName == "login") {
        await addIntegalInfo(userId)
        await addDayStat("login", userId)
        return true
    }
    // await statByResponse(request.session, response)
    return true
}

//////////////////////////////////////////////////////////////////
async function sendNotifyFor(user){
    var body = {
        hint:  "今天你还没有登陆",
        activity: "打开活动",
        score: 1000,
        openId: user._key,
        day: getlocalDateString()
    }

    var ret = await postJson(config.sendNotifyUrl, body)
    logger.info(`send notify url ${config.sendNotifyUrl} body  ${JSON.stringify(body)} , ret = ${JSON.stringify(ret)}`)
}

const luckyDrawScore = 200

async function queryUserIntegral(openId){
    var queryAql = `for doc in ${integralCollection} 
    filter doc._key == '${openId}'
    return doc`
    var doc = await arangoDb.querySingleDoc(queryAql)
    if(doc == null){
        return {totalScore: 0, usedScore: 0}
    }
    var ret = {}
    ret.totalScore = doc.totalScore,
    ret.usedScore = doc.usedScore,
    ret.remainScore = doc.totalScore - doc.usedScore,
    ret.drawTimes = Math.floor((doc.totalScore - doc.usedScore)/luckyDrawScore)
    return ret
}

//////////////////////////////////////////////////////////////////
async function  notifyUnLoginUsers(){
    var today = getlocalDateString()
    var queryAql = `for doc in ${integralCollection} 
    let lastLogin = LAST(doc.login)
    filter lastLogin.day != '${today}' and doc.state == 'active'
    return doc`
    var users = await arangoDb.queryDocs(queryAql)
    logger.info(`send notify users num is: ${users.length}`)
    users.forEach(user => {
        sendNotifyFor(user)
    });
}

//////////////////////////////////////////////////////////////////
async function deductIntegral(openId){
    var aql =  `for doc in ${integralCollection}
                filter doc._key=='${openId}' and (doc.totalScore - doc.usedScore) >= ${luckyDrawScore}
                UPDATE doc with{
                usedScore: doc.usedScore+${luckyDrawScore}
                } in ${integralCollection}
                LET previous = OLD 
                RETURN previous._key`

    var ret = await arangoDb.querySingleDoc(aql)
    return ret != null
}

async function awardInegral(openId){
    return await doUpdateIntegal("luckyDraw", openId, 1, {})
}

//////////////////////////////////////////////////////////////////
function calcDrawGrand(){
    var luckyNum = Math.floor(Math.random()*1000)
    logger.info("lucky num ",luckyNum)
    if(luckyNum > 0 && luckyNum < 200){
        return 1
    }
    if(luckyNum > 200 && luckyNum < 500){
        return 2
    }
    if(luckyNum > 500 && luckyNum < 800){
        return 3
    }
    return 0
}

//////////////////////////////////////////////////////////////////
async function doLuckyDraw(openId){
    var deductFlag = await deductIntegral(openId)
    if(deductFlag){
        var ret = {}
        var grand = calcDrawGrand()
        var flag = await allocAwardFor(openId, grand)
        if(flag){
            ret.grand = grand
            if(grand == 3){
                await awardInegral(openId)
            }
            return ret
        }       
        ret.grand = 0
        await allocAwardFor(openId, ret.grand)
        return ret
    }else{
        var ret = {
            grand: 0
        }
        return ret
    }
}

//////////////////////////////////////////////////////////////////
const awardCollection = "awardInfo"
async function allocAwardFor(openId, grand){
    var awardKey = "prize_" + grand
    logger.info("alloc awardInfo for", awardKey)
    var aql = `for doc in ${awardCollection}
                filter doc._key=='${awardKey}' and doc.remainNum >= 1
                UPDATE doc with{
                remainNum: doc.remainNum-1,
                prizeUsers : APPEND(doc.prizeUsers, {openId: '${openId}', date: DATE_ISO8601(DATE_NOW())})
                } in ${awardCollection}
                LET previous = OLD 
                RETURN previous._key`

    var ret = await arangoDb.querySingleDoc(aql)
    return ret != null
}

const userAwardCollection = "userAwardInfo"

async function queryAwardInfoBy(grand){
    var awardKey = "prize_" + grand
    var aql = `for doc in ${awardCollection}
               filter doc._key=='${awardKey}'
               return doc.awardDesc` 
    return await arangoDb.querySingleDoc(aql)
}

//////////////////////////////////////////////////////////////////
async function addPrizeConnectWay(openId, grand, phone){
    var award = await queryAwardInfoBy(grand)
    var doc = {}
    doc.openId = openId
    doc.grand = grand
    if(award){
        doc.awardDesc = award
    }
    doc.phone = phone 
    doc.time = getlocalTimeString()
    var ret = await arangoDb.saveDoc(userAwardCollection, doc)
    return ret
}

//////////////////////////////////////////////////////////////////
async function queryUserAwards(openId){
    var aql = `for doc in ${userAwardCollection}
               filter doc.openId=='${openId}'
               return doc` 
    var ret = await arangoDb.queryDocs(aql)

    return ret.map( item => {
        var baseInfo = {}
        baseInfo.grand = item.grand
        baseInfo.awardDesc = item.awardDesc
        baseInfo.time = item.time
        return baseInfo
    })
}

//////////////////////////////////////////////////////////////////
async function addShareStat(sourceId, destId, scene){
    var queryAql = `for doc in ${integralCollection} 
    filter doc._key == '${sourceId}'
    return doc.shareEvent`
    var doc = await arangoDb.queryDocs(queryAql)
    var sameEvents = doc.filter(event => {
        return event.destId == destId && event.scene == scene
    })
    if(sameEvents.length == 0){
        return await doUpdateIntegal("shareEvent", sourceId, 1, {destId, scene})
    }
    return true
}

//////////////////////////////////////////////////////////////////
async function loginScene(body){
    var scene = body.scene
    var query = body.query
    if(scene == 1007 || scene == 1008){
        return addShareStat(query.from, query.user, query.scene)
    }
    logger.info("loginScene is ", body)
}

module.exports={
    startIntegral,
    stopIntegral,
    textChatStat,
    eventChatStat,
    notifyUnLoginUsers,
    queryUserIntegral,
    addNewDictationStat,
    addPrizeConnectWay,
    doLuckyDraw,
    addShareStat,
    queryUserAwards,
    loginScene
}