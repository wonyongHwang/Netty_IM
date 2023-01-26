import { send, commands, packet, MsgHandle, registerHandle } from '@/ws/ws.js';
import { Notify } from 'vant';

class req { constructor(userId, addId) { this.userId = userId, this.addId = addId } }



function addFriend(addId) {
    var userid = JSON.parse(sessionStorage.getItem('loginUser')).userId;
    var addFriendReq = new req(userid, addId)

    var traceId = new Date().getTime();
    //组packet
    var p = new packet(commands.get('addFriend'), traceId, addFriendReq)

    var msg = new MsgHandle(p, addfunc);
    send(msg)
}

//添加方的回调
function addfunc(obj) {
    var data = obj.resp.data;
    Notify({
        type: 'success',
        message: '친구추가성공:'+data.userName,
        duration: 1000
    });
    friendsList.list.push({ 'userId': data.userId, 'userName': data.userName, status: 1 ,infoCount:1})
}


//被添加方的回调
function addedFunc(obj) {
    var data = obj.data;
    Notify({
        type: 'success',
        message: '새로운 친구추가'+data.userName,
        duration: 1000
    });
    friendsList.list.push({ 'userId': data.userId, 'userName': data.userName, status: 1 ,infoCount:1})
}
registerHandle(commands.get('ADD_NOTIRY'), addedFunc)

//好友列表
var friendsList = { list: [] };




export { addFriend, friendsList }