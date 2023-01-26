
//初始化
var socket;
if (!window.WebSocket) {
    window.WebSocket = window.MozWebSocket;
}
if (window.WebSocket) {
    // socket = new WebSocket("ws://"+window.location.host+"/websocket");
    socket = new WebSocket("ws://"+"smart.wonyong.net:8088"+"/websocket");
    //console.log("host : "+window.location.host);
    socket.onmessage = function (event) {
        var packet=JSON.parse( event.data);
        //查找下有没有traceId
        if(undefined== packet.traceId ||null==packet.traceId){
            //直接进注册的handle
            var handle=cmdHandle.get(packet.command)
            handle(packet)
        }else{
            //进队列中原消息的handle
            var index=wsMsgQueue.findIndex((n)=> {
                return n.req.command==packet.command&&n.req.traceId==packet.traceId
            })
            var msghandle;
            //remove
            if(index>=0){
                msghandle=wsMsgQueue.splice(index, 1)[0]
                msghandle.resp=packet;
                msghandle.handle(msghandle); // 콜백함수를 호출해준다.
            }

        }

    };
    socket.onopen = function (event) {
        console.info("websocket打开连接")
    };
    socket.onclose = function (event) {
        console.info("websocket关闭连接")
    };
} else {
    alert("Your browser does not support Web Socket.");
}


function send(msg) {
    if (!window.WebSocket) { return; }
    if (socket.readyState == WebSocket.OPEN) {

        if(msg instanceof packet){
            socket.send(JSON.stringify(msg));

        }else if(msg instanceof MsgHandle){
            socket.send(JSON.stringify( msg.req));
            //进队列
            wsMsgQueue.push(msg) // 전역변수에 저장해놨다가, 서버에서 응답을 받으면 저장해놨던 traceId로 조회해서 해당
                                 // traceId에 맵핑되는 콜백함수를 호출할때 쓴다.
        }
        
    } else {
        alert("The socket is not open.");
    }
}

function registerHandle(command,handle){
    cmdHandle.set(command,handle)
}

var wsMsgQueue=[]


//数据包格式
class packet{
    constructor(command,traceId,data){
        this.command = command,
        this.traceId = traceId,
        this.data = data
    }
}

//消息带handler
class MsgHandle{
    constructor(req,handle){
        this.req=req, //packet
        this.resp={}, //packet
        this.handle=handle // callback function
    }
}


//存储命令
const commands =new Map([
    ['login','0'],
    ['getUserList','1'],
    ['SEND_MSSAGE','2'],
    ['addFriend','3'],
    ['ADD_NOTIRY','4'],
    ['MESSAGE_NOTIFY','5'],
    ['OFFLINE_NOTIFY','6']
])

//存储命令对应的处理器
 var cmdHandle=new Map([ // 친구 추가 이벤트, 메시지 수신 등 리스닝해야 되는 이벤트의 핸들러를 등록해 두는 용도
                        // 웹소켓에서 데이터 수신시 traceId가 없는 이벤트에 해당되고,
                        // 이러한 이벤트는 cmdHandle에 등록해둔 커맨드에 매핑(Map)되는 핸들러 함수를 호출하게 된다.
     
])


export {send,commands,packet,MsgHandle,registerHandle}