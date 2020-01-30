package com.wks.wsIm.biz;

import com.wks.wsIm.domain.Packet;
import com.wks.wsIm.domain.req.AddFriendReq;
import com.wks.wsIm.domain.resp.AddFriendNotify;
import com.wks.wsIm.domain.resp.AddFriendResp;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;

import java.util.Map;

import static com.wks.wsIm.domain.Commands.ADD_FRIENDS;
import static com.wks.wsIm.domain.Commands.ADD_NOTIRY;
import static com.wks.wsIm.server.WebSocketFrameHandler.serializer;

@Command(ADD_FRIENDS)
public class AddFriendsService extends BaseService<AddFriendReq, AddFriendResp> {


    @Override
    AddFriendResp process(MsgContext context, AddFriendReq addFriendReq) {
        //TODO  需要做在线校验
        UserService.addFriend(addFriendReq.getUserId(), addFriendReq.getAddId());

        //响应被添加者
        UserInfo userInfo = UserService.getUserInfo(addFriendReq.getUserId());
        Packet p = new Packet(ADD_NOTIRY, null, new AddFriendNotify(userInfo.getUserId(), userInfo.getUserName()));

        //
        UserInfo addedUserInfo = UserService.getUserInfo(addFriendReq.getAddId());
        addedUserInfo.getChannel().writeAndFlush(new TextWebSocketFrame(serializer.serialize(p)));
        return new AddFriendResp("SUCCESS", "SUCCESS", addedUserInfo.getUserId(), addedUserInfo.getUserName());


    }
}
