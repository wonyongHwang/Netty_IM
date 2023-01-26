import { send, commands, packet, MsgHandle, registerHandle } from '@/ws/ws.js';
import { friendsList } from "@/ws/addFriend.js";
import { Notify } from 'vant';
import router from "@/router";
import EventBus from "@/event-bus";
class req { constructor(snedFromID, sendToId, msg) { this.snedFromID = snedFromID, this.sendToId = sendToId, this.msg = msg, this.time = new Date() } }


function sendMsg(sendToId, msg) {
    var userid = JSON.parse(sessionStorage.getItem('loginUser')).userId;
    var sendReq = new req(userid, sendToId, msg)

    var traceId = new Date().getTime();
    //组packet
    var p = new packet(commands.get('SEND_MSSAGE'), traceId, sendReq)


    //添加到消息box里
    var m = new Msg('send', msg, 'P')
    if (undefined == msgBox[sendToId] || null == msgBox[sendToId]) {
        msgBox[sendToId] = [m] //直接添加会导致vue无法监控，但 实际上这行在流程上不会被运行，
    } else {
        msgBox[sendToId].push(m)
    }


    var msgWithHandle = new MsgHandle(p, (obj) => {
        var data = obj.resp.data
        if (data.success != 'SUCCESS') {
            Notify({
                type: 'danger',
                message: '发送失败:' + data.reason,
                duration: 2000,
            });
            m.status = 'F'
        } else {
            m.status = 'S'
        }
    });
    send(msgWithHandle)
}



//接收
function receiveMsg(obj) {

    var data = obj.data;
    var snedFromID = data.fromId
    var m = new Msg('receive', data.msg, 'S')
    
    var board = [
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", ""),
        new Array("", "", "", "", "", "", "", "", "", "", "", "", "", "", "")
      ]

    //添加到msgBox
    if (undefined == msgBox[snedFromID] || null == msgBox[snedFromID]) {
        msgBox[snedFromID] = [m] //如果chat还没渲染，那么在这添加，等再进入时，是可以监控到的
    } else {
        msgBox[snedFromID].push(m)

        // [omokStart]


        // [omok]
        if(data.msg.includes('[omok]') == true){
            var tmpPos = (data.msg.split('[omok]')[1]).split(':')

            var tmpJson = {'board' : board, 'myTurn' : 'True'}

            var tmplocalStorage = localStorage.getItem(snedFromID)
            if(tmplocalStorage != null){
                // console.log(JSON.parse(tmplocalStorage))
                var tmpBoard = JSON.parse(tmplocalStorage)
                tmpJson['board'] = tmpBoard['board']
            }
            
            // console.log(tmpJson)
            // console.log(tmpJson['board'])
            if ( tmpJson['board'][tmpPos[0]][tmpPos[1]] != "") {
                swal({
                  icon: "error",
                  title: "첫 수가 충돌합니다. 다시 두세요.",
                  button: "다시두기"
                });
                return;
              }

            tmpJson['board'][tmpPos[0]][tmpPos[1]] = "○"
            
            localStorage.setItem(snedFromID,JSON.stringify(tmpJson))
        }

        // [omokFinish]
        if(data.msg.includes('[omokFinish]') == true){
            console.log("Finished by Opponents")
            localStorage.removeItem(snedFromID)
            EventBus.$emit('omok', "finish")
        }

        // redraw
        EventBus.$emit('omok', m)
    }
    //添加到friend
    var user = friendsList.list.find((v) => { return v.userId === snedFromID })
    user.infoCount++;

    //如果在聊天界面且对方是这个消息的发送人，则不提示
    if (router.app._route.name != 'Chat' || router.app._route.params.sendToId!=snedFromID) {
        Notify({
            type: 'success',
            message: '新消息,' + data.fromName + ':' + data.msg,
            duration: 2000,
            onClick: function () {
                router.push("/Chat/" + snedFromID + "/" + data.fromName);
            }
        });
    }

}

//注册接收信息的handle
registerHandle(commands.get('MESSAGE_NOTIFY'), receiveMsg)


class Msg {
    constructor(direct, msg, status) {
        this.direct = direct,
            this.status = status,
            this.msg = msg,
            this.time = new Date().Format("hh:mm:ss-S")
    }
}

//结构为 
var msgBox = {}


export { msgBox, sendMsg }


