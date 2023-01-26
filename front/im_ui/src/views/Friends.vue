<template>
  <div class="container">
    <div class="friendList">
      <van-list finished-text="...">
        <template v-for="{userName,userId,status,infoCount} in list">
          <van-cell id="friend_cell" v-bind:key="userId" @click="click(userId,userName)" size="large">
            <van-icon id="friend_icon" name="user-o" :info="infoCount>0?infoCount:null" />
            {{userName}}
            <van-tag :type="status==1?'success':'default'">{{status==1?'온라인':'오프라인'}}</van-tag>
          </van-cell>
        </template>
      </van-list>
    </div>
  </div>
</template>


<script>
import router from "@/router";
import { friendsList } from "@/ws/addFriend.js";

export default {
  name: "Friends",
  data: () => {
    return {
      list: friendsList.list
    };
  },
  methods: {
    click(userId,userName) {
      console.log("friends clicked")
      router.push("/Chat/" + userId+"/"+userName);
    }
  }
};
</script>


<style scoped>
#friend_icon {
  display: inline-block;
  margin-right: 20px;
}

#friend_cell{
  line-height: 37px 
}
</style>